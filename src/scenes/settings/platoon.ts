import {
    Extra,
    Markup,
    SceneContextMessageUpdate,
    Scene,
    Stage,
} from "telegraf";

import { GENERAL_CONTROLS } from "@/constants/controls";
import { MENU_SCENARIO, SETTINGS_SCENARIO } from "@/constants/scenarios";

import {
    // resolveReadUserSelection,
    resolveWriteUserSelection,
} from "@/resolvers/firebase";
import track from "@/resolvers/metricaTrack";
import { resolvePlatoonsFromPlatoonType } from "@/resolvers/schedule";

import {
    ensureFromIdAndMessageText,
    ensureMessageText,
} from "@/helpers/scenes";
import createScene from "@/helpers/createScene";
import { makeKeyboardColumns } from "@/helpers/scenes";
import { SceneContextMessageUpdateWithSession } from "@/typings/custom";

const enterHandler = ({ reply, message }: SceneContextMessageUpdate) => {
    const platoonType = ensureMessageText(message, reply);
    const platoonsControls = resolvePlatoonsFromPlatoonType(platoonType);

    const controls = [
        ...makeKeyboardColumns(platoonsControls, 2),
        [GENERAL_CONTROLS.BACK, GENERAL_CONTROLS.MENU],
    ];

    const markup = Extra.markup(Markup.keyboard(controls));
    return reply("Выберите нужный взвод", markup);
};

const messageHandler = async ({
    from,
    message,
    reply,
    scene,
    session,
}: SceneContextMessageUpdateWithSession<{ platoonType: string }>) => {
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
        reply("Настройки сохранены 💾");

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
    resultProcessor: (scene: Scene<SceneContextMessageUpdate>) => {
        scene.hears(
            GENERAL_CONTROLS.BACK,
            Stage.enter(SETTINGS_SCENARIO.PLATOON_TYPE_SCENE),
        );

        return scene;
    },
});
