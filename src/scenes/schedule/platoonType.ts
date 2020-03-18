import { Extra, Markup, SceneContextMessageUpdate, Stage } from "telegraf";

import { GENERAL_CONTROLS } from "@/constants/controls";
import { SCHEDULE_SCENARIO } from "@/constants/scenarios";
import { PLATOON_TYPES } from "@/constants/configuration";

import track from "@/resolvers/metricaTrack";
import { resolveWriteUserSelection } from "@/resolvers/firebase";

import createScene from "@/helpers/createScene";
import { ensureFromIdAndMessageText } from "@/helpers/scenes";

const enterHandler = ({ reply }: SceneContextMessageUpdate) => {
    const controls = [...PLATOON_TYPES, GENERAL_CONTROLS.menu];
    return reply(
        "Выберите цикл",
        Extra.markup(({ resize }: Markup) => resize().keyboard(controls)),
    );
};

const messageHandler = async ({
    from,
    message,
    reply,
}: SceneContextMessageUpdate) => {
    const [fromId, messageText] = await ensureFromIdAndMessageText(
        from,
        message,
        reply,
    );

    if (messageText in PLATOON_TYPES) {
        await resolveWriteUserSelection(fromId, "platoonType", messageText);

        track(fromId, messageText, "Выбран цикл");
        // TODO: scene.enter is possible
        return Stage.enter(SCHEDULE_SCENARIO.PLATOON_SCENE);
    } else {
        // TODO: check everywhere if we should return in replies and scene.enter's
        return reply("Выберите существующий цикл, или вернитесь в меню");
    }
};

export default () =>
    createScene({
        name: SCHEDULE_SCENARIO.PLATOON_TYPE_SCENE,
        enterHandler,
        messageHandler,
    });
