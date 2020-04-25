import { Stage } from "telegraf";
import { SceneContextMessageUpdate } from "telegraf/typings/stage";

import createMenuScene from "./menu";

import createSettingsScene from "./settings";
import createSettingsPlatoonTypeScene from "./settings/platoonType";
import createSettingsPlatoonScene from "./settings/platoon";
import createSettingsAboutScene from "./settings/about";

import createSchedulePlatoonTypeScene from "./schedule/platoonType";
import createSchedulePlatoonScene from "./schedule/platoon";
import createScheduleDateScene from "./schedule/date";

import createDefaultScheduleDateScene from "./defaultSchedule/date";

import createNewsScene from "./news";

export default function registerScenes(): Stage<SceneContextMessageUpdate> {
    return new Stage([
        createMenuScene,

        createSettingsScene,
        createSettingsPlatoonTypeScene,
        createSettingsPlatoonScene,
        createSettingsAboutScene,

        createSchedulePlatoonTypeScene,
        createSchedulePlatoonScene,
        createScheduleDateScene,

        createDefaultScheduleDateScene,

        createNewsScene,
    ]);
}
