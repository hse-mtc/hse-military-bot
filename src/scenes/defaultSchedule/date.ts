import { Extra, Markup, SceneContextMessageUpdate, Stage } from "telegraf";

import {
    DEFAULT_PLATOON_SCHEDULE_SUCCESS,
    DEFAULT_PLATOON_SCHEDULE_FAILURE,
    DEFAULT_PLATOON_SCHEDULE_IS_CHOSEN,
} from "@/constants/metricaGoals";
import { SCHEDULE_DATES } from "@/constants/configuration";
import { GENERAL_CONTROLS } from "@/constants/controls";
import {
    MENU_SCENARIO,
    DEFAULT_SCHEDULE_SCENARIO,
} from "@/constants/scenarios";

import track from "@/resolvers/metricaTrack";
import { resolveReadUserSelection } from "@/resolvers/firebase";
import { resolveScheduleFromPlatoon } from "@/resolvers/schedule";

import createScene from "@/helpers/createScene";
import { getYearIndexFromPlatoonSafe } from "@/helpers/dates";
import { ensureFromId, ensureFromIdAndMessageText } from "@/helpers/scenes";

const enterHandler = async ({ from, reply }: SceneContextMessageUpdate) => {
    const fromId = await ensureFromId(from, reply);

    let platoon = "";
    try {
        platoon = await resolveReadUserSelection(fromId, "defaultPlatoon");

        reply(`Ваш взвод: ${platoon}`);
        track(fromId, platoon, "Выбрано расписание для дефолтного взвода");
    } catch (exception) {
        // TODO: make correct exception handling
        reply("Не удалось определить взвод");
        track(
            fromId,
            DEFAULT_PLATOON_SCHEDULE_FAILURE.message,
            DEFAULT_PLATOON_SCHEDULE_FAILURE.goal,
        );

        // TODO: throw exception?
        // TODO: is it working properly?
        return Stage.enter(MENU_SCENARIO.MAIN_SCENE);
    }

    const platoonYearIndex = getYearIndexFromPlatoonSafe(platoon, reply);

    const controls = [
        ...SCHEDULE_DATES[platoonYearIndex],
        ...Object.keys(GENERAL_CONTROLS.menu),
    ];
    const markup = Extra.markup(({ resize }: Markup) =>
        resize().keyboard(controls),
    );

    return reply("Выберите дату", markup);
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

    const platoon = await resolveReadUserSelection(fromId, "defaultPlatoon");
    const platoonYearIndex = getYearIndexFromPlatoonSafe(platoon, reply);

    if (messageText in SCHEDULE_DATES[platoonYearIndex]) {
        return reply("Выберите существующую дату, или вернитесь в меню");
    }

    track(fromId, messageText, DEFAULT_PLATOON_SCHEDULE_IS_CHOSEN.goal);

    try {
        const { schedule } = await resolveScheduleFromPlatoon(
            platoon,
            messageText,
        );

        track(
            fromId,
            DEFAULT_PLATOON_SCHEDULE_SUCCESS.message,
            DEFAULT_PLATOON_SCHEDULE_SUCCESS.goal,
        );

        return reply(schedule.join("\n\n"));
    } catch (exception) {
        reply("Что-то пошло не так, попробуйте снова");
        track(
            fromId,
            DEFAULT_PLATOON_SCHEDULE_FAILURE.message,
            DEFAULT_PLATOON_SCHEDULE_FAILURE.goal,
        );

        // TODO: throw exception
        // TODO: is it working properly?
        return Stage.enter(MENU_SCENARIO.MAIN_SCENE);
    }
};

export default () =>
    createScene({
        name: DEFAULT_SCHEDULE_SCENARIO.DATE_SCENE,
        enterHandler,
        messageHandler,
    });
