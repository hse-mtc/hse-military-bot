import { join } from "path";

import * as dotenv from "dotenv";
import program from "commander";

import Bot from "@/modules/Bot";
import Server from "@/modules/Server";
import Logger from "@/modules/Logger";
import Metrica from "@/modules/Metrica";
import { FirebaseUsers } from "@/modules/Firebase";
import { ScheduleDownloader, ScheduleStorage } from "@/modules/Schedule";

program
    .version("1.0.0")
    .option(
        "-m, --mode <string>",
        "Available modes: debug, serverOnly, development, production, downloader, parser",
        "production",
    )
    .parse(process.argv);

const starter = async (): Promise<void> => {
    const { mode = "production" } = program;
    const rootPath = process.env.NODE_PATH;

    if (!rootPath) {
        Logger.error("Please, provide NODE_PATH env variable");
        process.exit(1);
    }

    dotenv.config({
        path: join(rootPath, ".env"),
    });

    Logger.info(`Starting ${mode} mode...`);

    switch (mode) {
        case "debug":
        case "development":
        case "production": {
            Metrica.setup();
            FirebaseUsers.setup();

            Bot.setup();
            await Server.setup({ useBot: true });

            if (["development", "debug"].includes(mode)) {
                require("log-that-http");
            }

            break;
        }
        case "parser":
            break;
        case "serverOnly": {
            Metrica.setup();
            await Server.setup({ useBot: false });

            break;
        }
        case "downloader": {
            try {
                await ScheduleDownloader.downloadSchedule();
            } catch (exception) {
                Logger.error(
                    `Error happened in ScheduleDownloader: ${exception}`,
                );
                process.exit(1);
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
        await ScheduleStorage.fromDumpOrBuild({
            forceBuild: mode === "downloader",
        });
    } catch (exception) {
        Logger.error(`Error happened in ScheduleStorage: ${exception}`);
    }

    process.on("uncaughtException", (error) => Logger.error(error));
};

// No need to subscribe on uncaughtException due to pm2
// which restarts on uncaughtException or SIGs
starter();
