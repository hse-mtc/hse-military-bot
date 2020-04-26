import path from "path";

import helmet from "helmet";
import favicon from "serve-favicon";
import timeout from "connect-timeout";
import compression from "compression";
import cookieParser from "cookie-parser";
import responseTime from "response-time";
import rateLimit from "express-rate-limit";
import addRequestId from "express-request-id";
import express from "express";

import {
    resolveBotConfigSync,
    resolveEnvironmentSync,
} from "@/resolvers/config";
import Bot from "@/modules/Bot";
import BaseError from "@/modules/BaseError";
import Logger, { ExpressLogger } from "@/modules/Logger";
import setupRoutes from "@/api/v1/routes";

const WebHookError = BaseError.createErrorGenerator("WebHookError");
const ExpressInitError = BaseError.createErrorGenerator("ExpressInitError");

// TODO: all functions from classes should have modifiers (private, public, readonly)
class ExpressApp {
    // TODO: wtf??
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    private _app;
    private _bot: typeof Bot | null = null;

    private readonly _publicPath = path.join(
        process.env.NODE_PATH ?? "",
        "public",
    );

    async setup({ useBot }: { useBot: boolean }): Promise<void> {
        this._app = express();

        if (useBot) {
            this._bot = Bot;
        }

        try {
            await this._configure();
        } catch (exception) {
            Logger.error(`Error during starting server: ${exception}`);
        }
    }

    private async _initializeBot(url: string, env: string): Promise<void> {
        if (!this._bot || this._bot.instance === null) {
            throw ExpressInitError(
                'Provide bot and use property "{ useBot: true }"',
            );
        }

        const { token } = resolveBotConfigSync();
        const botInstance = this._bot.instance;

        if (env === "development") {
            Logger.info("Setting the LongPolling mode...");
            try {
                await botInstance.telegram.deleteWebhook();
            } catch (exception) {
                Logger.warn("Cannot delete WebHook in development");
            }

            botInstance.startPolling();
        } else {
            Logger.info("Setting the WebHook mode...");

            const isWebhookSet = await botInstance.telegram.setWebhook(
                `${url}/bot${token}`,
            );

            if (!isWebhookSet) {
                throw WebHookError("Cannot set WebHook in production");
            }

            this._app.use(botInstance.webhookCallback(`/bot${token}`));
        }
    }

    private async _configure(): Promise<void> {
        const { env, port, url } = resolveEnvironmentSync();

        if (this._bot !== null) {
            await this._initializeBot(url, env);
        }

        /* Add request id */
        this._app.use(addRequestId());

        /* Limit overall RPS to 5 RPS per user */
        this._app.use(
            rateLimit({
                windowMs: 60 * 1000, // 1 minute
                max: 300, // limit each IP to 120 requests per windowMs
            }),
        );

        /* Add some security */
        this._app.use(helmet());

        /* Add some compression */
        this._app.use(compression());

        /* Log before the routes */
        this._app.use(ExpressLogger);

        /* Timeout 5s for all requests */
        this._app.use(timeout("5s"));

        /* Body Parser */
        this._app.use(express.json());
        this._app.use(express.urlencoded({ extended: true }));

        /* Cookie Parser */
        this._app.use(cookieParser());

        /* X-Response-Time header */
        this._app.use(responseTime());

        this._app.use(express.static(this._publicPath));
        this._app.use(favicon("public/favicon.ico"));

        /* Routes */
        setupRoutes(this._app);

        /* Timeout checker */
        // TODO: wtf??
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        this._app.use((req, _res, next) => {
            if (!req.timedout) {
                next();
            }
        });

        this._app.listen(port, () => {
            Logger.info(`Server is running on port ${port}!`);
        });
    }
}

export default new ExpressApp();
