import { Extra, Markup, Stage } from "telegraf";

import { GENERAL_CONTROLS } from "@/constants/controls";
import { MENU_SCENARIO, SETTINGS_SCENARIO } from "@/constants/scenarios";

import {
    resolveWriteUserSelection,
    resolveReadUserSelection,
} from "@/resolvers/firebase";
import track from "@/resolvers/metricaTrack";
import { resolvePlatoonsFromPlatoonType } from "@/resolvers/schedule";

import createScene from "@/helpers/createScene";
import { ensureFromIdAndMessageText } from "@/helpers/scenes";

import { SceneHandler } from "@/typings/custom";
import { makeKeyboardColumns } from "@/helpers/scenes";

const enterHandler: SceneHandler = async ({ from, message, reply }) => {
    const [fromId, platoonType] = ensureFromIdAndMessageText(
        from,
        message,
        reply,
    );

    const defaultPlatoon = await resolveReadUserSelection(
        fromId,
        "defaultPlatoon",
    );

    const platoonsControls = resolvePlatoonsFromPlatoonType(platoonType);
    const controls = [
        ...makeKeyboardColumns(platoonsControls, 2),
        [GENERAL_CONTROLS.BACK, GENERAL_CONTROLS.MENU],
    ];

    const markup = Extra.markup(Markup.keyboard(controls));
    return reply(
        `Ваш текущий взвод: ${defaultPlatoon}. Выберите нужный взвод:`,
        markup,
    );
};

const messageHandler: SceneHandler<{
    platoonType: string;
}> = async ({ from, message, reply, scene, session }) => {
    const [fromId, messageText] = ensureFromIdAndMessageText(
        from,
        message,
        reply,
    );

    const platoonType = session.platoonType;
    const platoons = resolvePlatoonsFromPlatoonType(platoonType);

    if (platoons.includes(messageText)) {
        await resolveWriteUserSelection(fromId, "defaultPlatoon", messageText);

        track(fromId, messageText, "Выбран дефолтный взвод в настройках");
        await reply("Настройки сохранены 💾");

        return scene.enter(MENU_SCENARIO.MAIN_SCENE);
    } else {
        return reply(
            "Выберите существующий взвод, или вернитесь в меню",
            Extra.markup(Markup.resize(true)),
        );
    }
};

export default createScene({
    name: SETTINGS_SCENARIO.PLATOON_SCENE,
    enterHandler,
    messageHandler,
    resultProcessor: (scene) => {
        scene.hears(
            GENERAL_CONTROLS.BACK,
            Stage.enter(SETTINGS_SCENARIO.PLATOON_TYPE_SCENE),
        );

        return scene;
    },
});
