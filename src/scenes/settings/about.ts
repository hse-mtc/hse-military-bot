import { Stage, Extra, Markup } from "telegraf";

import { GENERAL_CONTROLS } from "@/constants/controls";
import { SETTINGS_SCENARIO } from "@/constants/scenarios";

import createScene from "@/helpers/createScene";
import { SceneHandler } from "@/typings";

const enterHandler: SceneHandler = async ({ reply }) => {
    await reply(
        "Бот версии 2.0. Был создан @mvshmakov при поддержке взвода 1606.",
        Extra.markup(
            Markup.inlineKeyboard([
                [
                    {
                        text: "📃 Сайт",
                        url: "https://hse-military-bot.herokuapp.com",
                    },
                ],
                [
                    {
                        text: "🗞 Группа VK",
                        url: "https://vk.com/hse_military_bot",
                    },
                    {
                        text: "💻 Репозиторий",
                        url: "https://github.com/mvshmakov/hse-military-bot",
                    },
                ],
            ]),
        ),
    );

    const controls = [[GENERAL_CONTROLS.BACK, GENERAL_CONTROLS.MENU]];

    return reply(
        "Выберите нужный пункт меню",
        Extra.markup(Markup.keyboard(controls)),
    );
};

export default createScene({
    name: SETTINGS_SCENARIO.ABOUT_SCENE,
    enterHandler,
    resultProcessor: (scene) => {
        scene.hears(
            GENERAL_CONTROLS.BACK,
            Stage.enter(SETTINGS_SCENARIO.MAIN_SCENE),
        );

        return scene;
    },
});
