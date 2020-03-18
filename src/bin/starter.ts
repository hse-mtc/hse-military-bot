import { join } from "path";

import * as dotenv from "dotenv";
import program from "commander";

import Bot from "@/modules/Bot";
import Server from "@/modules/Server";
import Logger from "@/modules/Logger";
import Metrica from "@/modules/Metrica";
import { FirebaseUsers } from "@/modules/Firebase";
import { ScheduleDownloader, ScheduleStorage } from "@/modules/Schedule";
import { resolveEnvironmentSync } from "@/resolvers/config";

program
    .version("1.0.0")
    .option(
        "-m, --mode <string>",
        "Available modes: debug, serverOnly, development",
        "development",
    )
    .parse(process.argv);

// TODO: npm audit/npm dedupe (-p)/npm ci
const starter = async () => {
    const { mode = "development" } = program;

    const { env } = resolveEnvironmentSync();
    const dotenvConf = { path: join(__dirname, "../../configs") };

    if (env === "development") {
        dotenv.config({
            ...dotenvConf,
            debug: true,
        });
    } else {
        dotenv.config(dotenvConf);
    }

    Logger.info(`Starting ${mode} mode...`);

    switch (mode) {
        case "debug":
        case "development":
        case "production": {
            Metrica.setup();
            FirebaseUsers.setup();

            Bot.setup();
            Server.setup({ useBot: true });

            break;
        }
        case "serverOnly": {
            Metrica.setup();
            Server.setup({ useBot: false });

            break;
        }
        case "downloader": {
            try {
                await ScheduleDownloader.downloadSchedule();
            } catch (exception) {
                Logger.error(
                    `Error happened in ScheduleDownloader: ${exception}`,
                );
            }

            break;
        }
        default: {
            Logger.error(
                "Available modes: debug, serverOnly, development, production, downloader",
            );
            process.exit(1);
        }
    }

    try {
        await ScheduleStorage.fromDumpOrBuild();
    } catch (exception) {
        Logger.error(`Error happened in ScheduleStorage: ${exception}`);
    }

    process.on("uncaughtException", (error) => Logger.error(error));
};

starter()
    .then(() => Logger.info("Successfully!"))
    .catch((error) => Logger.error(error));
