import { Extra, Markup, SceneContextMessageUpdate, Stage } from "telegraf";

import { GENERAL_CONTROLS } from "@/constants/controls";
import { PLATOONS, PLATOON_TYPES } from "@/constants/configuration";
import { MENU_SCENARIO, SETTINGS_SCENARIO } from "@/constants/scenarios";

import track from "@/resolvers/metricaTrack";
import {
    resolveReadUserSelection,
    resolveWriteUserSelection,
} from "@/resolvers/firebase";

import createScene from "@/helpers/createScene";
import {
    ensureFromIdAndMessageText,
    ensureMessageText,
} from "@/helpers/scenes";

const enterHandler = async ({ reply, message }: SceneContextMessageUpdate) => {
    const messageText = await ensureMessageText(message, reply);

    // Validation was on the previous step, so we are sure that messageText is one of PLATOON_TYPES
    const platoonTypeIndex = PLATOON_TYPES.indexOf(messageText as any);
    const controls = [...PLATOONS[platoonTypeIndex], GENERAL_CONTROLS.menu];

    const markup = Extra.markup(({ resize }: Markup) =>
        resize().keyboard(controls),
    );
    return reply("Выберите нужный взвод", markup);
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
    const validPlatoonType = PLATOONS[PLATOON_TYPES.indexOf(platoonType)];

    if (messageText in validPlatoonType) {
        await resolveWriteUserSelection(fromId, "defaultPlatoon", messageText);
        track(fromId, messageText, "Выбран дефолтный взвод в настройках");

        await reply("Настройки сохранены");

        return Stage.enter(MENU_SCENARIO.MAIN_SCENE);
    } else {
        return reply("Выберите существующий взвод, или вернитесь в меню");
    }
};

export default () =>
    createScene({
        name: SETTINGS_SCENARIO.PLATOON_SCENE,
        enterHandler,
        messageHandler,
    });
