import { Extra, Markup, SceneContextMessageUpdate } from "telegraf";

import { GENERAL_CONTROLS } from "@/constants/controls";
import { SCHEDULE_SCENARIO } from "@/constants/scenarios";

import track from "@/resolvers/metricaTrack";
import { resolvePlatoonTypes } from "@/resolvers/schedule";

import {
    ensureFromIdAndMessageText,
    makeKeyboardColumns,
} from "@/helpers/scenes";
import createScene from "@/helpers/createScene";
import { SceneContextMessageUpdateWithSession } from "@/typings/custom";

const enterHandler = ({ reply }: SceneContextMessageUpdate) => {
    const platoonTypesControls = resolvePlatoonTypes();
    const controls = [
        ...makeKeyboardColumns(platoonTypesControls, 2),
        [GENERAL_CONTROLS.MENU],
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
    const [fromId, platoonType] = ensureFromIdAndMessageText(
        from,
        message,
        reply,
    );

    const platoonTypes = resolvePlatoonTypes();

    if (platoonTypes.includes(platoonType)) {
        session.platoonType = platoonType;
        track(fromId, platoonType, "Выбран цикл");

        return scene.enter(SCHEDULE_SCENARIO.PLATOON_SCENE);
    } else {
        // TODO: check everywhere that we should return in replies and scene.enter's
        return reply(
            "Выберите существующий цикл или вернитесь в меню",
            Extra.markup(Markup.resize(true)),
        );
    }
};

export default createScene({
    name: SCHEDULE_SCENARIO.PLATOON_TYPE_SCENE,
    enterHandler,
    messageHandler,
});
