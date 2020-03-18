import path from "path";

import helmet from "helmet";
import favicon from "serve-favicon";
import rateLimit from "express-rate-limit";
import addRequestId from "express-request-id";
import express, { Application } from "express";

import Bot from "@/modules/Bot";
import Logger, { ExpressLogger } from "@/modules/Logger";
import createError from "@/helpers/createError";
import { commonRoutes, scheduleRoutes } from "@/api/v1/routes";
import {
    resolveBotConfigSync,
    resolveEnvironmentSync,
} from "@/resolvers/config";

// TODO: all functions from classes should have modifiers (private, public, readonly)
class ExpressApp {
    private _app: Application;
    private _bot: typeof Bot | null = null;

    private readonly _publicPath = "../../public";

    public WebHookSettingError = createError({
        name: "WebHookSettingError",
        message: "Cannot set WebHook in production",
    });

    public WebHookDeletionError = createError({
        name: "WebHookDeletionError",
        message: "Cannot delete WebHook in development",
    });

    public BotInitWithoutBotDeletionError = createError({
        name: "BotInitWithoutBotDeletionError",
        message: 'Provide bot and use property "useBot: true"',
    });

    setup({ useBot }: { useBot: boolean }) {
        this._app = express();

        if (useBot) {
            this._bot = Bot;
        }

        this._configure()
            .then(() => Logger.info("Server started!"))
            .catch((error) =>
                Logger.error(`Error during starting server: {${error}`),
            );
    }

    private async _initializeBot(url: string, env: string) {
        if (!this._bot || this._bot.instance === null) {
            throw new this.BotInitWithoutBotDeletionError();
        }

        const { token } = resolveBotConfigSync();
        const botInstance = this._bot.instance;

        if (env === "development") {
            const isWebHookDeleted = await botInstance.telegram.deleteWebhook();

            if (!isWebHookDeleted) {
                throw new this.WebHookDeletionError();
            }

            botInstance.startPolling();
        } else {
            const isWebHookSet = botInstance.telegram.setWebhook(
                `${url}/bot${token}`,
            );

            if (!isWebHookSet) {
                throw new this.WebHookSettingError();
            }

            this._app.use(botInstance.webhookCallback(`/bot${token}`));
        }
    }

    private async _configure(): Promise<void> {
        const { env, port, url } = resolveEnvironmentSync();

        if (this._bot !== null) {
            await this._initializeBot(url, env);
        }

        this._app.use(addRequestId);

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
        this._app.use(favicon("favicon.ico"));

        /* Routes */
        this._app.use(commonRoutes);
        this._app.use(scheduleRoutes);
        // this._app.use(debugRoutes);

        this._app.listen(port, () => {
            Logger.info(`Server running on port ${port}`);
        });
    }
}

export default new ExpressApp();
