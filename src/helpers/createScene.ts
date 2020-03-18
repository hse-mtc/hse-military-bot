import { Stage, Scene, BaseScene, SceneContextMessageUpdate } from "telegraf";
import { GENERAL_CONTROLS } from "@/constants/controls";

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
    const newScene = new BaseScene<SceneContextMessageUpdate>(sceneName);

    if (enterHandler) {
        newScene.enter(enterHandler);
    }

    newScene.hears(GENERAL_CONTROLS.menu, enter("menu"));
    newScene.command("menu", ({ scene }) => scene.enter("menu"));
    newScene.command("help", ({ reply }) =>
        reply("Навигация в боте производится с помощью меню."),
    );

    if (messageHandler) {
        newScene.on("message", messageHandler);
    }

    if (resultProcessor) {
        return resultProcessor(newScene);
    }

    return newScene;
}
