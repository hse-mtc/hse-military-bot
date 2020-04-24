import Telegraf, {
    Stage,
    Scene,
    BaseScene,
    SceneContextMessageUpdate,
} from "telegraf";

import { MENU_SCENARIO } from "@/constants/scenarios";
import { GENERAL_CONTROLS } from "@/constants/controls";
import { handleUnhandledMessageDefault } from "@/helpers/scenes";

const { enter } = Stage;

type TCreateSceneParams = {
    name: string;
    enterHandler?: (ctx: SceneContextMessageUpdate) => any;
    messageHandler?: (ctx: SceneContextMessageUpdate) => any;
    resultProcessor?: (
        scene: Scene<SceneContextMessageUpdate>,
    ) => Scene<SceneContextMessageUpdate>;
};

export default function createScene({
    name: sceneName,
    enterHandler,
    messageHandler,
    resultProcessor,
}: TCreateSceneParams): Scene<SceneContextMessageUpdate> {
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
