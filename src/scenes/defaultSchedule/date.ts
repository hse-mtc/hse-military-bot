import { Extra, Markup } from "telegraf";

import {
    MENU_SCENARIO,
    DEFAULT_SCHEDULE_SCENARIO,
} from "@/constants/scenarios";
import {
    DEFAULT_PLATOON_SCHEDULE_SUCCESS,
    DEFAULT_PLATOON_SCHEDULE_FAILURE,
    DEFAULT_PLATOON_SCHEDULE_IS_CHOSEN,
} from "@/constants/metricaGoals";
import { GENERAL_CONTROLS } from "@/constants/controls";

import {
    resolveScheduleFromPlatoon,
    resolveAvailableDatesFromPlatoon,
    resolvePlatoons,
} from "@/resolvers/schedule";
import track from "@/resolvers/metricaTrack";
import { resolveReadUserSelection } from "@/resolvers/firebase";

import {
    ensureFromId,
    ensureFromIdAndMessageText,
    makeKeyboardColumns,
} from "@/helpers/scenes";
import createScene from "@/helpers/createScene";
import { formatHtmlScheduleResponse } from "@/helpers/schedule";

import { SceneHandler } from "@/typings";

type TSession = {
    defaultPlatoon: string;
};

const enterHandler: SceneHandler<TSession> = async ({
    from,
    reply,
    scene,
    session,
}) => {
    let platoon = "";
    const fromId = ensureFromId(from, reply);

    try {
        platoon = await resolveReadUserSelection(fromId, "defaultPlatoon");
        const platoons = resolvePlatoons();

        if (!platoons.includes(platoon)) {
            await reply(
                `Выбран неактуальный взвод: ${platoon}. Смените в настройках`,
            );
            track(fromId, platoon, "Выбран неактуальный взвод");
            return scene.enter(MENU_SCENARIO.MAIN_SCENE);
        }

        session.defaultPlatoon = platoon;

        await reply(`Ваш взвод: ${platoon}`);
        track(fromId, platoon, "Выбрано расписание для дефолтного взвода");
    } catch (exception) {
        // TODO: make correct exception handling
        await reply("Не удалось определить взвод");
        track(
            fromId,
            DEFAULT_PLATOON_SCHEDULE_FAILURE.MESSAGE,
            DEFAULT_PLATOON_SCHEDULE_FAILURE.GOAL,
        );

        // TODO: throw exception?
        return scene.enter(MENU_SCENARIO.MAIN_SCENE);
    }

    const platoonDatesControls = resolveAvailableDatesFromPlatoon(platoon);
    const controls = [
        ...makeKeyboardColumns(platoonDatesControls, 2),
        [GENERAL_CONTROLS.MENU],
    ];

    const markup = Extra.markup(Markup.keyboard(controls));
    return reply("Выберите дату 📅", markup);
};

const messageHandler: SceneHandler<TSession> = async ({
    from,
    message,
    reply,
    replyWithHTML,
    scene,
    session,
}) => {
    const [fromId, messageText] = ensureFromIdAndMessageText(
        from,
        message,
        reply,
    );

    const platoon = session.defaultPlatoon;
    const platoonDates = resolveAvailableDatesFromPlatoon(platoon);

    if (!platoonDates.includes(messageText)) {
        return reply(
            "Выберите существующую дату, или вернитесь в меню",
            Extra.markup(Markup.resize(true)),
        );
    }

    track(fromId, messageText, DEFAULT_PLATOON_SCHEDULE_IS_CHOSEN.GOAL);

    try {
        const schedule = resolveScheduleFromPlatoon(platoon, messageText);

        track(
            fromId,
            DEFAULT_PLATOON_SCHEDULE_SUCCESS.MESSAGE,
            DEFAULT_PLATOON_SCHEDULE_SUCCESS.GOAL,
        );

        await replyWithHTML(
            formatHtmlScheduleResponse(platoon, messageText, schedule),
        );

        return reply(
            "Выберите дату или вернитесь в меню",
            Extra.markup(Markup.resize(true)),
        );
    } catch (exception) {
        await reply("Что-то пошло не так, попробуйте снова 🧐");
        track(
            fromId,
            DEFAULT_PLATOON_SCHEDULE_FAILURE.MESSAGE,
            DEFAULT_PLATOON_SCHEDULE_FAILURE.GOAL,
        );
        // TODO: throw exception
    }

    return scene.enter(MENU_SCENARIO.MAIN_SCENE);
};

export default createScene({
    name: DEFAULT_SCHEDULE_SCENARIO.DATE_SCENE,
    enterHandler,
    messageHandler,
});
