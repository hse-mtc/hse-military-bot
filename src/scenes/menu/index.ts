import {
    Stage,
    Extra,
    SceneContextMessageUpdate,
    Markup,
    Scene,
} from "telegraf";

import {
    MENU_SCENARIO,
    NEWS_SCENARIO,
    SETTINGS_SCENARIO,
    SCHEDULE_SCENARIO,
    DEFAULT_SCHEDULE_SCENARIO,
} from "@/constants/scenarios";
import createScene from "@/helpers/createScene";
import { MENU_CONTROLS } from "@/constants/controls";
import { TReplyOrChangeScene } from "@/typings/custom";
import { resolveReadUserSelection } from "@/resolvers/firebase";
import { ensureFromId, handleStickerButton } from "@/helpers/scenes";

const { enter } = Stage;

const constructMenuControls = (defaultPlatoon: string): string[] => {
    return Object.entries(MENU_CONTROLS).reduce(
        (accumulator, [key, buttonText]) => {
            if (!defaultPlatoon && key === MENU_CONTROLS.SCHEDULE_DEFAULT) {
                return accumulator;
            }

            return [...accumulator, buttonText];
        },
        [],
    );
};

const enterHandler = async ({
    from,
    reply,
}: SceneContextMessageUpdate): Promise<TReplyOrChangeScene> => {
    const fromId = ensureFromId(from, reply);
    const defaultPlatoon = await resolveReadUserSelection(
        fromId,
        "defaultPlatoon",
    );

    const controls = constructMenuControls(defaultPlatoon);
    const markup = Extra.markup(Markup.keyboard(controls));

    return reply("Выберите нужный пункт меню", markup);
};

export default createScene({
    name: MENU_SCENARIO.MAIN_SCENE,
    enterHandler,
    resultProcessor: (scene: Scene<SceneContextMessageUpdate>) => {
        scene.hears(
            MENU_CONTROLS.SCHEDULE_DEFAULT,
            enter(DEFAULT_SCHEDULE_SCENARIO.DATE_SCENE),
        );
        scene.hears(
            MENU_CONTROLS.SCHEDULE,
            enter(SCHEDULE_SCENARIO.PLATOON_TYPE_SCENE),
        );
        scene.hears(MENU_CONTROLS.NEWS, enter(NEWS_SCENARIO.NEWS_SCENE));
        scene.hears(MENU_CONTROLS.STICKERS, handleStickerButton);
        scene.hears(
            MENU_CONTROLS.SETTINGS,
            enter(SETTINGS_SCENARIO.MAIN_SCENE),
        );

        return scene;
    },
});
