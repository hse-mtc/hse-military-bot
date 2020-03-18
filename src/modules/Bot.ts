import Telegraf, { Stage, session, ContextMessageUpdate } from "telegraf";

// TODO: check everywhere order of imports
import {
    DEFAULT_SCHEDULE_SCENARIO,
    MENU_SCENARIO,
    NEWS_SCENARIO,
    SCHEDULE_SCENARIO,
    SETTINGS_SCENARIO,
} from "@/constants/scenarios";
import registerScenes from "@/scenes";
import { MENU_CONTROLS } from "@/constants/controls";
import { resolveBotConfigSync } from "@/resolvers/config";
import { handleStickerButton } from "@/helpers/scenes";

const { enter } = Stage;

class Bot {
    private _instance: Telegraf<ContextMessageUpdate>;
    private readonly _username: "hse_military_bot";

    get instance(): Telegraf<ContextMessageUpdate> {
        return this._instance;
    }

    public setup(): void {
        const { token } = resolveBotConfigSync();

        this._instance = new Telegraf(token, {
            username: this._username,
            // TODO: wtf and use it in production?
            telegram: {
                webhookReply: true,
            },
        });

        this._instance.use(registerScenes().middleware());
        this._instance.use(session());

        this._initMainListeners();
    }

    private _initMainListeners(): void {
        this._instance.command("menu", enter(MENU_SCENARIO.MAIN_SCENE));
        this._instance.command("help", ({ reply }) =>
            reply("Навигация в боте производится с помощью меню."),
        );

        this._instance.hears(
            MENU_CONTROLS.SCHEDULE_DEFAULT,
            enter(DEFAULT_SCHEDULE_SCENARIO.DATE_SCENE),
        );
        this._instance.hears(
            MENU_CONTROLS.schedule,
            enter(SCHEDULE_SCENARIO.PLATOON_TYPE_SCENE),
        );
        this._instance.hears(
            MENU_CONTROLS.news,
            enter(NEWS_SCENARIO.NEWS_SCENE),
        );
        this._instance.hears(MENU_CONTROLS.stickers, handleStickerButton);
        this._instance.hears(
            MENU_CONTROLS.settings,
            enter(SETTINGS_SCENARIO.MAIN_SCENE),
        );
        this._instance.on("message", enter(MENU_SCENARIO.MAIN_SCENE));
    }
}

export default new Bot();
