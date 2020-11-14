import Telegraf, { session, Stage, Middleware } from "telegraf";
import { TelegrafContext } from "telegraf/typings/context";
import TelegrafLogger from "telegraf-logger";

// TODO: check everywhere order of imports
import {
    DEFAULT_SCHEDULE_SCENARIO,
    MENU_SCENARIO,
    NEWS_SCENARIO,
    SCHEDULE_SCENARIO,
    SETTINGS_SCENARIO,
} from "@/constants/scenarios";
import {
    resolveBotConfigSync,
    resolveEnvironmentSync,
} from "@/resolvers/config";
import Logger from "@/modules/Logger";
import registerScenes from "@/scenes";
import { MENU_CONTROLS } from "@/constants/controls";
import { handleStickerButton } from "@/helpers/scenes";
import { resolveUpdateUserSelection } from "@/resolvers/firebase";

const { enter } = Stage;

class Bot {
    private _instance: Telegraf<TelegrafContext>;
    private readonly _username: "hse_military_bot";

    get instance(): Telegraf<TelegrafContext> {
        return this._instance;
    }

    private _writeUserDataMiddleware: Middleware<TelegrafContext> = (
        ctx,
        next,
    ) => {
        const message = ctx.update.message;
        if (!message || !message.from) {
            return next();
        }

        const { from, chat, date } = message;

        if (from.id === chat.id) {
            resolveUpdateUserSelection(from.id, {
                ...from,
                type: chat.type,
                lastAccess: date,
            });
        } else {
            resolveUpdateUserSelection(from.id, {
                ...from,
                ...chat,
                type: chat.type,
                lastAccess: date,
            });
        }

        return next();
    };

    public setup(): void {
        const { token } = resolveBotConfigSync();
        const { env } = resolveEnvironmentSync();

        this._instance = new Telegraf(token, {
            username: this._username,
            telegram: {
                webhookReply: env === "production",
            },
        });

        const logger = new TelegrafLogger({
            log: Logger.log,
        });
        this._instance.use(logger.middleware());
        this._instance.use(this._writeUserDataMiddleware);
        // this._instance.use(Telegraf.log());

        // To use same session in private chat with bot and in inline mode
        this._instance.use(
            session({
                getSessionKey: (ctx: TelegrafContext) => {
                    if (ctx.from && ctx.chat) {
                        return `${ctx.from.id}:${ctx.chat.id}`;
                    } else if (ctx.from && ctx.inlineQuery) {
                        return `${ctx.from.id}:${ctx.from.id}`;
                    }
                    return "";
                },
            }),
        );

        this._instance.use(registerScenes().middleware());
        this._initMainListeners();

        Logger.info("Bot started!");
    }

    private _initMainListeners(): void {
        // TODO: send user stats to db
        this._instance.command("start", enter(MENU_SCENARIO.MAIN_SCENE));
        this._instance.command("menu", enter(MENU_SCENARIO.MAIN_SCENE));
        this._instance.command(
            "help",
            Telegraf.reply(
                "Навигация в боте производится с помощью меню. Вопросы пишите @mvshmakov",
            ),
        );

        this._instance.hears(
            MENU_CONTROLS.SCHEDULE_DEFAULT,
            enter(DEFAULT_SCHEDULE_SCENARIO.DATE_SCENE),
        );
        this._instance.hears(
            MENU_CONTROLS.SCHEDULE,
            enter(SCHEDULE_SCENARIO.PLATOON_TYPE_SCENE),
        );
        this._instance.hears(
            MENU_CONTROLS.NEWS,
            enter(NEWS_SCENARIO.NEWS_SCENE),
        );
        this._instance.hears(MENU_CONTROLS.STICKERS, handleStickerButton);
        this._instance.hears(
            MENU_CONTROLS.SETTINGS,
            enter(SETTINGS_SCENARIO.MAIN_SCENE),
        );
        this._instance.on("message", enter(MENU_SCENARIO.MAIN_SCENE));
    }
}

export default new Bot();
