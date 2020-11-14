import { Stage, Extra, Markup } from "telegraf";

import { SETTINGS_SCENARIO } from "@/constants/scenarios";
import { GENERAL_CONTROLS, SETTINGS_CONTROLS } from "@/constants/controls";

import createScene from "@/helpers/createScene";
import { SceneHandler } from "@/typings";

const enterHandler: SceneHandler = async ({ reply }) => {
    const controls = [
        [SETTINGS_CONTROLS.DEFAULT_PLATOON, SETTINGS_CONTROLS.ABOUT],
        [GENERAL_CONTROLS.MENU],
    ];

    const markup = Extra.markup(Markup.keyboard(controls));
    return reply("Выберите нужный пункт настроек:", markup);
};

export default createScene({
    name: SETTINGS_SCENARIO.MAIN_SCENE,
    enterHandler,
    resultProcessor: (scene) => {
        scene.hears(
            SETTINGS_CONTROLS.DEFAULT_PLATOON,
            Stage.enter(SETTINGS_SCENARIO.PLATOON_TYPE_SCENE),
        );

        scene.hears(
            SETTINGS_CONTROLS.ABOUT,
            Stage.enter(SETTINGS_SCENARIO.ABOUT_SCENE),
        );

        return scene;
    },
});
