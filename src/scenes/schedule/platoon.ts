import {
    Extra,
    Markup,
    SceneContextMessageUpdate,
    Scene,
    Stage,
} from "telegraf";

import { GENERAL_CONTROLS } from "@/constants/controls";
import { SCHEDULE_SCENARIO } from "@/constants/scenarios";

import track from "@/resolvers/metricaTrack";
import { resolvePlatoonsFromPlatoonType } from "@/resolvers/schedule";

import {
    ensureFromIdAndMessageText,
    ensureMessageText,
    makeKeyboardColumns,
} from "@/helpers/scenes";
import createScene from "@/helpers/createScene";
import { SceneContextMessageUpdateWithSession } from "@/typings/custom";

const enterHandler = ({ message, reply }: SceneContextMessageUpdate) => {
    const platoonType = ensureMessageText(message, reply);

    // Validation was on the previous step, so we are sure that messageText is one of PLATOON_TYPES
    const platoonsControls = resolvePlatoonsFromPlatoonType(platoonType);
    const controls = [
        ...makeKeyboardColumns(platoonsControls, 2),
        [GENERAL_CONTROLS.BACK, GENERAL_CONTROLS.MENU],
    ];

    const markup = Extra.markup(Markup.keyboard(controls));
    return reply("Выберите взвод", markup);
};

const messageHandler = ({
    from,
    message,
    reply,
    scene,
    session,
}: SceneContextMessageUpdateWithSession<{
    platoonType: string;
    platoon: string;
}>) => {
    const [fromId, platoon] = ensureFromIdAndMessageText(from, message, reply);

    const platoonType = session.platoonType;
    const platoons = resolvePlatoonsFromPlatoonType(platoonType);

    if (platoons.includes(platoon)) {
        session.platoon = platoon;
        track(fromId, platoon, "Выбран взвод");

        return scene.enter(SCHEDULE_SCENARIO.DATE_SCENE);
    } else {
        return reply(
            "Выберите существующий взвод, или вернитесь в меню",
            Extra.markup(Markup.resize(true)),
        );
    }
};

export default createScene({
    name: SCHEDULE_SCENARIO.PLATOON_SCENE,
    enterHandler,
    messageHandler,
    resultProcessor: (scene: Scene<SceneContextMessageUpdate>) => {
        scene.hears(
            GENERAL_CONTROLS.BACK,
            Stage.enter(SCHEDULE_SCENARIO.PLATOON_TYPE_SCENE),
        );

        return scene;
    },
});
