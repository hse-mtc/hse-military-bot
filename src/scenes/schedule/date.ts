import { Extra, Markup, Stage } from "telegraf";

import { GENERAL_CONTROLS } from "@/constants/controls";
import { MENU_SCENARIO, SCHEDULE_SCENARIO } from "@/constants/scenarios";

import {
    resolveScheduleFromPlatoon,
    resolveAvailableDatesFromPlatoon,
} from "@/resolvers/schedule";
import track from "@/resolvers/metricaTrack";

import {
    ensureFromIdAndMessageText,
    makeKeyboardColumns,
} from "@/helpers/scenes";
import createScene from "@/helpers/createScene";
import { formatHtmlScheduleResponse } from "@/helpers/schedule";

import { SceneHandler } from "@/typings";

const enterHandler: SceneHandler<{
    platoonType: string;
    platoon: string;
}> = async ({ session, reply }) => {
    const platoon = session.platoon;

    const platoonDatesControls = resolveAvailableDatesFromPlatoon(platoon);
    const controls = [
        ...makeKeyboardColumns(platoonDatesControls, 2),
        [GENERAL_CONTROLS.BACK, GENERAL_CONTROLS.MENU],
    ];

    const markup = Extra.markup(Markup.keyboard(controls));
    return reply("Выберите дату 📅", markup);
};

const messageHandler: SceneHandler<{
    platoonType: string;
    platoon: string;
}> = async ({ from, message, reply, replyWithHTML, scene, session }) => {
    const [fromId, messageText] = ensureFromIdAndMessageText(
        from,
        message,
        reply,
    );

    const platoon = session.platoon;
    const platoonDates = resolveAvailableDatesFromPlatoon(platoon);

    if (!platoonDates.includes(messageText)) {
        return reply(
            "Выберите существующую дату, или вернитесь в меню",
            Extra.markup(Markup.resize(true)),
        );
    }

    track(fromId, messageText, "Выбрана дата");

    try {
        const schedule = resolveScheduleFromPlatoon(platoon, messageText);
        track(fromId, "Успех", "Корректно выдано расписание");

        await replyWithHTML(
            formatHtmlScheduleResponse(platoon, messageText, schedule),
        );

        return reply("Выберите дату или вернитесь в меню");
    } catch (exception) {
        await reply("Что-то пошло не так, попробуйте снова 🧐");
        track(fromId, "Ошибка", "Некорректно выдано расписание");
        // TODO: throw exception?
        return scene.enter(MENU_SCENARIO.MAIN_SCENE);
    }
};

export default createScene({
    name: SCHEDULE_SCENARIO.DATE_SCENE,
    enterHandler,
    messageHandler,
    resultProcessor: (scene) => {
        scene.hears(
            GENERAL_CONTROLS.BACK,
            Stage.enter(SCHEDULE_SCENARIO.PLATOON_TYPE_SCENE),
        );

        return scene;
    },
});
