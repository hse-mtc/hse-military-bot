import { Extra, Markup, SceneContextMessageUpdate, Stage } from "telegraf";

import { SCHEDULE_DATES } from "@/constants/configuration";
import { GENERAL_CONTROLS } from "@/constants/controls";
import { MENU_SCENARIO, SCHEDULE_SCENARIO } from "@/constants/scenarios";

import { resolveReadUserSelection } from "@/resolvers/firebase";
import { resolveScheduleFromPlatoon } from "@/resolvers/schedule";

import track from "@/resolvers/metricaTrack";
import createScene from "@/helpers/createScene";
import { getYearIndexFromPlatoonSafe } from "@/helpers/dates";
import { ensureFromId, ensureFromIdAndMessageText } from "@/helpers/scenes";

const enterHandler = async ({ from, reply }: SceneContextMessageUpdate) => {
    const fromId = await ensureFromId(from, reply);
    const platoon = await resolveReadUserSelection(fromId, "platoon");

    const controls = [
        ...SCHEDULE_DATES[getYearIndexFromPlatoonSafe(platoon, reply)],
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

    const platoon = await resolveReadUserSelection(fromId, "platoon");
    const platoonYearIndex = getYearIndexFromPlatoonSafe(platoon, reply);

    if (!(messageText in SCHEDULE_DATES[platoonYearIndex])) {
        return reply("Выберите существующую дату, или вернитесь в меню");
    }

    track(fromId, messageText, "Выбрана дата");

    try {
        const { schedule } = await resolveScheduleFromPlatoon(
            platoon,
            messageText,
        );

        reply(schedule.join("\n\n"));
        track(fromId, "Успех", "Корректно выдано расписание");

        return Stage.enter(MENU_SCENARIO.MAIN_SCENE);
    } catch (exception) {
        reply("Что-то пошло не так, попробуйте снова");
        track(fromId, "Ошибка", "Некорректно выдано расписание");

        // TODO: throw exception?
        return Stage.enter(MENU_SCENARIO.MAIN_SCENE);
    }
};

export default () =>
    createScene({
        name: SCHEDULE_SCENARIO.DATE_SCENE,
        enterHandler,
        messageHandler,
    });
