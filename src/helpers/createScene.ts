import Telegraf, { Stage, BaseScene } from "telegraf";
import { SceneContextMessageUpdate, Scene } from "telegraf/typings/stage";

import { MENU_SCENARIO } from "@/constants/scenarios";
import { GENERAL_CONTROLS } from "@/constants/controls";
import { handleUnhandledMessageDefault } from "@/helpers/scenes";
import { SceneHandler } from "@/typings";

const { enter } = Stage;

type CreateSceneParams = {
    name: string;
    enterHandler?: SceneHandler;
    messageHandler?: SceneHandler;
    resultProcessor?: (
        scene: Scene<SceneContextMessageUpdate>,
    ) => Scene<SceneContextMessageUpdate>;
};

export default function createScene({
    name: sceneName,
    enterHandler,
    messageHandler,
    resultProcessor,
}: CreateSceneParams): Scene<SceneContextMessageUpdate> {
    let newScene = new BaseScene<SceneContextMessageUpdate>(sceneName);

    if (enterHandler) {
        newScene.enter(enterHandler);
    }

    newScene.hears(GENERAL_CONTROLS.MENU, enter(MENU_SCENARIO.MAIN_SCENE));

    newScene.command("menu", ({ scene }) =>
        scene.enter(MENU_SCENARIO.MAIN_SCENE),
    );
    newScene.command(
        "help",
        Telegraf.reply(
            "Навигация в боте производится с помощью меню. Вопросы пишите @mvshmakov",
        ),
    );

    if (resultProcessor) {
        newScene = resultProcessor(newScene);
    }

    if (messageHandler) {
        newScene.on("message", messageHandler);
    } else {
        newScene.on("message", handleUnhandledMessageDefault);
    }

    return newScene;
}
