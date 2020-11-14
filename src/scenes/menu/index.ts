import { Stage, Extra, Markup } from "telegraf";

import {
    MENU_SCENARIO,
    NEWS_SCENARIO,
    SETTINGS_SCENARIO,
    SCHEDULE_SCENARIO,
    DEFAULT_SCHEDULE_SCENARIO,
} from "@/constants/scenarios";
import { MENU_CONTROLS } from "@/constants/controls";
import { resolveReadUserSelection } from "@/resolvers/firebase";

import createScene from "@/helpers/createScene";
import { ensureFromId, handleStickerButton } from "@/helpers/scenes";

import { SceneHandler } from "@/typings";

const { enter } = Stage;

const constructMenuControls = (defaultPlatoon: string): string[] => {
    return Object.values(MENU_CONTROLS).reduce((accumulator, buttonText) => {
        if (!defaultPlatoon && buttonText === MENU_CONTROLS.SCHEDULE_DEFAULT) {
            return accumulator;
        }

        return [...accumulator, buttonText];
    }, []);
};

const enterHandler: SceneHandler = async ({ from, reply }) => {
    const fromId = ensureFromId(from, reply);
    const defaultPlatoon = await resolveReadUserSelection(
        fromId,
        "defaultPlatoon",
    );

    const controls = constructMenuControls(defaultPlatoon);
    const markup = Extra.markup(Markup.keyboard(controls));

    return reply("Выберите нужный пункт меню:", markup);
};

export default createScene({
    name: MENU_SCENARIO.MAIN_SCENE,
    enterHandler,
    resultProcessor: (scene) => {
        scene.hears(
            MENU_CONTROLS.SCHEDULE_DEFAULT,
            enter(DEFAULT_SCHEDULE_SCENARIO.DATE_SCENE),
        );
        scene.hears(
            MENU_CONTROLS.SCHEDULE,
            enter(SCHEDULE_SCENARIO.PLATOON_TYPE_SCENE),
        );
        scene.hears(MENU_CONTROLS.NEWS, enter(NEWS_SCENARIO.NEWS_SCENE));
        scene.hears(MENU_CONTROLS.STICKERS, handleStickerButton);
        scene.hears(
            MENU_CONTROLS.SETTINGS,
            enter(SETTINGS_SCENARIO.MAIN_SCENE),
        );

        return scene;
    },
});
