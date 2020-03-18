import { Stage, Extra, SceneContextMessageUpdate, Markup } from "telegraf";

import { SETTINGS_SCENARIO } from "@/constants/scenarios";
import { GENERAL_CONTROLS, SETTINGS_CONTROLS } from "@/constants/controls";

import createScene from "@/helpers/createScene";

const enterHandler = ({ reply }: SceneContextMessageUpdate) => {
    const settingsArray = Object.values(SETTINGS_CONTROLS);
    const controls = settingsArray.concat(GENERAL_CONTROLS.menu);

    const markup = Extra.markup(({ resize }: Markup) =>
        resize().keyboard(controls),
    );
    return reply("Выберите нужный пункт настроек", markup);
};

const messageHandler = ({ reply }: SceneContextMessageUpdate) =>
    reply("Выберите существующую настройку, или вернитесь в меню");

export default () =>
    createScene({
        name: SETTINGS_SCENARIO.MAIN_SCENE,
        enterHandler,
        messageHandler,
        resultProcessor: (settingsScene) => {
            settingsScene.hears(
                SETTINGS_CONTROLS.defaultPlatoon,
                Stage.enter(SETTINGS_SCENARIO.PLATOON_TYPE_SCENE),
            );

            return settingsScene;
        },
    });
