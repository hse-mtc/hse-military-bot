import { ContextMessageUpdate, Middleware, Stage } from "telegraf";

import createMenuScene from "./menu";

import createSettingsScene from "./settings";
import createSettingsPlatoonTypeScene from "./settings/platoonType";
import createSettingsPlatoonScene from "./settings/platoon";

import createSchedulePlatoonTypeScene from "./schedule/platoonType";
import createSchedulePlatoonScene from "./schedule/platoon";
import createScheduleDateScene from "./schedule/date";

import createDefaultScheduleDateScene from "./defaultSchedule/date";

import createNewsScene from "./news";

export default function registerScenes() {
    return new Stage([
        createMenuScene(),

        createSettingsScene(),
        createSettingsPlatoonTypeScene(),
        createSettingsPlatoonScene(),

        createSchedulePlatoonTypeScene(),
        createSchedulePlatoonScene(),
        createScheduleDateScene(),

        createDefaultScheduleDateScene(),

        createNewsScene(),
    ]);
}
