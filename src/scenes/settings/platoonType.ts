import { Extra, Markup, SceneContextMessageUpdate, Stage } from "telegraf";

import { PLATOON_TYPES } from "@/constants/configuration";
import { GENERAL_CONTROLS } from "@/constants/controls";
import { SETTINGS_SCENARIO } from "@/constants/scenarios";

import { resolveWriteUserSelection } from "@/resolvers/firebase";

import createScene from "@/helpers/createScene";
import { ensureFromIdAndMessageText } from "@/helpers/scenes";

const enterHandler = ({ reply }: SceneContextMessageUpdate) => {
    const controls = [...PLATOON_TYPES, GENERAL_CONTROLS.menu];
    const markup = Extra.markup(({ resize }: Markup) =>
        resize().keyboard(controls),
    );

    return reply("Выберите цикл", markup);
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

    // TODO: поправить сцены!!
    if (messageText in PLATOON_TYPES) {
        await resolveWriteUserSelection(fromId, "platoonType", messageText);
        return Stage.enter(SETTINGS_SCENARIO.PLATOON_SCENE);
    } else {
        return reply("Выберите существующий цикл, или вернитесь в меню");
    }
};

export default () =>
    createScene({
        name: SETTINGS_SCENARIO.PLATOON_TYPE_SCENE,
        enterHandler,
        messageHandler,
    });
