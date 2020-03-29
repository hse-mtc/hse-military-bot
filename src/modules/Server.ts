import path from "path";

import helmet from "helmet";
import favicon from "serve-favicon";
import rateLimit from "express-rate-limit";
import addRequestId from "express-request-id";
import express, { Application } from "express";

import {
    resolveBotConfigSync,
    resolveEnvironmentSync,
} from "@/resolvers/config";
import Bot from "@/modules/Bot";
import BaseError from "@/modules/BaseError";
import Logger, { ExpressLogger } from "@/modules/Logger";
import { commonRoutes, scheduleRoutes, debugRoutes } from "@/api/v1/routes";

const WebHookError = BaseError.createErrorGenerator("WebHookError");
const ExpressInitError = BaseError.createErrorGenerator("ExpressInitError");

// TODO: all functions from classes should have modifiers (private, public, readonly)
class ExpressApp {
    private _app: Application;
    private _bot: typeof Bot | null = null;

    private readonly _publicPath = "../../public";

    async setup({ useBot }: { useBot: boolean }): Promise<void> {
        this._app = express();

        if (useBot) {
            this._bot = Bot;
        }

        try {
            await this._configure();
            Logger.info("Server started!");
        } catch (exception) {
            Logger.error(`Error during starting server: {${exception}`);
        }
    }

    private async _initializeBot(url: string, env: string): Promise<void> {
        if (!this._bot || this._bot.instance === null) {
            throw ExpressInitError(
                'Provide bot and use property "useBot: true"',
            );
        }

        const { token } = resolveBotConfigSync();
        const botInstance = this._bot.instance;

        if (env === "development") {
            const isWebHookDeleted = await botInstance.telegram.deleteWebhook();

            if (!isWebHookDeleted) {
                throw WebHookError("Cannot delete WebHook in development");
            }

            botInstance.startPolling();
        } else {
            const isWebHookSet = botInstance.telegram.setWebhook(
                `${url}/bot${token}`,
            );

            if (!isWebHookSet) {
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

        /* Log before the routes */
        this._app.use(ExpressLogger);

        /* Body Parser */
        this._app.use(express.json());
        this._app.use(express.urlencoded({ extended: true }));

        this._app.use(express.static(path.join(__dirname, this._publicPath)));
        this._app.use(favicon("public/favicon.ico"));

        /* Routes */
        this._app.use(commonRoutes);
        this._app.use(scheduleRoutes);
        this._app.use(debugRoutes);

        this._app.listen(port, () => {
            Logger.info(`Server running on port ${port}`);
        });
    }
}

export default new ExpressApp();
