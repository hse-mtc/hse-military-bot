import {
    Extra,
    Markup,
    SceneContextMessageUpdate,
    Stage,
    Scene,
} from "telegraf";

import { GENERAL_CONTROLS } from "@/constants/controls";
import { SETTINGS_SCENARIO } from "@/constants/scenarios";

import { resolvePlatoonTypes } from "@/resolvers/schedule";

import createScene from "@/helpers/createScene";
import { makeKeyboardColumns, ensureMessageText } from "@/helpers/scenes";
import { SceneContextMessageUpdateWithSession } from "@/typings/custom";

const enterHandler = ({ reply }: SceneContextMessageUpdate) => {
    const platoonTypesControls = resolvePlatoonTypes();
    const controls = [
        ...makeKeyboardColumns(platoonTypesControls, 2),
        [GENERAL_CONTROLS.BACK, GENERAL_CONTROLS.MENU],
    ];

    const markup = Extra.markup(Markup.keyboard(controls));
    return reply("Выберите цикл", markup);
};

const messageHandler = ({
    from,
    message,
    reply,
    scene,
    session,
}: SceneContextMessageUpdateWithSession<{ platoonType: string }>) => {
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
    resultProcessor: (scene: Scene<SceneContextMessageUpdate>) => {
        scene.hears(
            GENERAL_CONTROLS.BACK,
            Stage.enter(SETTINGS_SCENARIO.MAIN_SCENE),
        );

        return scene;
    },
});
