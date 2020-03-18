import { Extra, Markup, SceneContextMessageUpdate, Stage } from "telegraf";

import { GENERAL_CONTROLS } from "@/constants/controls";
import { SCHEDULE_SCENARIO } from "@/constants/scenarios";
import { PLATOONS, PLATOON_TYPES } from "@/constants/configuration";

import {
    resolveReadUserSelection,
    resolveWriteUserSelection,
} from "@/resolvers/firebase";

import track from "@/resolvers/metricaTrack";
import createScene from "@/helpers/createScene";
import {
    ensureFromIdAndMessageText,
    ensureMessageText,
} from "@/helpers/scenes";

const enterHandler = async ({ message, reply }: SceneContextMessageUpdate) => {
    const messageText = await ensureMessageText(message, reply);

    // Validation was on the previous step, so we are sure that messageText is one of PLATOON_TYPES
    const platoonTypeIndex = PLATOON_TYPES.indexOf(messageText as any);
    const controls = [...PLATOONS[platoonTypeIndex], GENERAL_CONTROLS.menu];

    const markup = Extra.markup(({ resize }: Markup) =>
        resize().keyboard(controls),
    );
    return reply("Выберите взвод", markup);
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
    const platoonType = await resolveReadUserSelection(fromId, "platoonType");

    if (messageText in PLATOONS[PLATOON_TYPES.indexOf(platoonType)]) {
        await resolveWriteUserSelection(fromId, "platoon", messageText);

        track(fromId, messageText, "Выбран взвод");
        return Stage.enter(SCHEDULE_SCENARIO.DATE_SCENE);
    } else {
        return reply("Выберите существующий взвод, или вернитесь в меню");
    }
};

export default () =>
    createScene({
        name: SCHEDULE_SCENARIO.PLATOON_SCENE,
        enterHandler,
        messageHandler,
    });
