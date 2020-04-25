import { Extra, Markup, Stage } from "telegraf";

import { GENERAL_CONTROLS } from "@/constants/controls";
import { SETTINGS_SCENARIO } from "@/constants/scenarios";

import {
    resolvePlatoonTypes,
    resolvePlatoonTypeFromPlatoon,
    resolvePlatoons,
} from "@/resolvers/schedule";
import { resolveReadUserSelection } from "@/resolvers/firebase";

import {
    makeKeyboardColumns,
    ensureMessageText,
    ensureFromId,
} from "@/helpers/scenes";
import createScene from "@/helpers/createScene";
import { SceneHandler } from "@/typings/custom";

const enterHandler: SceneHandler = async ({ from, reply }) => {
    const fromId = ensureFromId(from, reply);
    const platoons = resolvePlatoons();
    const platoonTypesControls = resolvePlatoonTypes();

    const defaultPlatoon = await resolveReadUserSelection(
        fromId,
        "defaultPlatoon",
    );

    const controls = [
        ...makeKeyboardColumns(platoonTypesControls, 2),
        [GENERAL_CONTROLS.BACK, GENERAL_CONTROLS.MENU],
    ];
    const markup = Extra.markup(Markup.keyboard(controls));

    if (defaultPlatoon === null) {
        return reply(
            "Можно выбрать свой взвод и он всегда будет в главном меню! Для начала, выберите цикл:",
            markup,
        );
    }

    if (!platoons.includes(defaultPlatoon)) {
        return reply(
            `У вас неактуальный взвод: ${defaultPlatoon}, выберите новее. Для начала, выберите цикл:`,
            markup,
        );
    }

    const defaultPlatoonType = resolvePlatoonTypeFromPlatoon(defaultPlatoon);

    return reply(
        `Ваш текущий цикл: ${defaultPlatoonType}. Выберите нужный цикл:`,
        markup,
    );
};

const messageHandler: SceneHandler<{
    platoonType: string;
}> = ({ message, reply, scene, session }) => {
    const messageText = ensureMessageText(message, reply);
    const platoonTypes = resolvePlatoonTypes();

    // TODO: поправить сцены!!
    if (platoonTypes.includes(messageText)) {
        session.platoonType = messageText;
        return scene.enter(SETTINGS_SCENARIO.PLATOON_SCENE);
    } else {
        return reply(
            "Выберите существующий цикл или вернитесь в меню",
            Extra.markup(Markup.resize(true)),
        );
    }
};

export default createScene({
    name: SETTINGS_SCENARIO.PLATOON_TYPE_SCENE,
    enterHandler,
    messageHandler,
    resultProcessor: (scene) => {
        scene.hears(
            GENERAL_CONTROLS.BACK,
            Stage.enter(SETTINGS_SCENARIO.MAIN_SCENE),
        );

        return scene;
    },
});
