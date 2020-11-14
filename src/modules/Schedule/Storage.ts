import makeError from "make-error";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolveScheduleFileConfigSync } from "@/resolvers/config";

import { ScheduleParser, ScheduleObject } from ".";

const ScheduleStorageError = makeError("ScheduleStorageError");

class ScheduleStorage {
    private _instance: ScheduleObject;

    get instanсe(): ScheduleObject {
        return this._instance;
    }

    async fromDumpOrBuild(): Promise<void> {
        const {
            schedulePath,
            parsedSchedulePath,
        } = resolveScheduleFileConfigSync();

        // Trying to restore existing parsed schedule from JSON on disk
        if (existsSync(parsedSchedulePath)) {
            this._instance = JSON.parse(
                readFileSync(parsedSchedulePath, "utf8"),
            );
        } else {
            await this.buildSchedule(schedulePath, parsedSchedulePath);
        }
    }

    async buildSchedule(
        schedulePath: string,
        parsedSchedulePath: string,
    ): Promise<void> {
        try {
            this._instance = await ScheduleParser.parse(schedulePath);
            this.dumpSchedule(this._instance, parsedSchedulePath);
        } catch (exception) {
            // TODO: нормальные трейсы у ошибок в логах
            throw new ScheduleStorageError("Cannot build ScheduleStorage");
        }
    }

    dumpSchedule(
        builtSchedule: ScheduleObject,
        parsedSchedulePath: string,
    ): void {
        try {
            const jsonString = JSON.stringify(builtSchedule);
            writeFileSync(parsedSchedulePath, jsonString, "utf8");
        } catch (exception) {
            throw new ScheduleStorageError("Cannot dump ScheduleStorage");
        }
    }
}

export default new ScheduleStorage();
