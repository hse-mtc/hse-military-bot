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
import { MENU_CONTROLS } from "@/constants/controls";
import { TReplyOrChangeScene } from "@/typings/custom";
import { resolveReadUserSelection } from "@/resolvers/firebase";
import createScene from "@/helpers/createScene";
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
    const fromId = await ensureFromId(from, reply);
    const defaultPlatoon = await resolveReadUserSelection(
        fromId,
        "defaultPlatoon",
    );

    const controls = constructMenuControls(defaultPlatoon);
    const markup = Extra.markup(({ resize }: Markup) =>
        resize().keyboard(controls),
    );

    return reply("Выберите нужный пункт меню", markup);
};

export default (): Scene<SceneContextMessageUpdate> =>
    createScene({
        name: MENU_SCENARIO.MAIN_SCENE,
        enterHandler,
        messageHandler: handleStickerButton,
        resultProcessor: (menuScene: Scene<SceneContextMessageUpdate>) => {
            menuScene.hears(
                MENU_CONTROLS.SCHEDULE_DEFAULT,
                enter(DEFAULT_SCHEDULE_SCENARIO.DATE_SCENE),
            );
            menuScene.hears(
                MENU_CONTROLS.schedule,
                enter(SCHEDULE_SCENARIO.PLATOON_TYPE_SCENE),
            );
            menuScene.hears(
                MENU_CONTROLS.news,
                enter(NEWS_SCENARIO.NEWS_SCENE),
            );
            menuScene.hears(
                MENU_CONTROLS.settings,
                enter(SETTINGS_SCENARIO.MAIN_SCENE),
            );
            return menuScene;
        },
    });
