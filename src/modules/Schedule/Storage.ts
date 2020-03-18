import { existsSync, readFileSync, writeFileSync } from "fs";

import createError from "@/helpers/createError";
import { ScheduleParser } from "@/modules/Schedule";
import { resolveScheduleFileConfig } from "@/resolvers/config";

type TPlatoonDates = {
    // { '1701': [Array], '1702': [Array], ... }
    [platoon: string]: string[];
};

export type TSchedule = {
    weekday: string;
    schedule: string[];
};

export type TScheduleStorageInstance = {
    meta: {
        // [ 'Офицеры - разведка', 'Сержанты МСВ', 'Офицеры ВКС', ... ],
        platoonTypes: string[];
        // { 'Офицеры - разведка': [Array], 'Сержанты МСВ': [Array], ... }
        platoons: {
            [platoonType: string]: string[];
        };
        dates: TPlatoonDates;
    };
    schedule: {
        // {
        // 	'Офицеры - разведка': {
        // 		'1703': {
        // 			'10 января': {
        // 				'weekday': 'Пятница',
        // 				'schedule': [
        // 					'Тех.П ПЗ 14 -1 Ауд 110 Синицын В.Н.   Ребров Ю.И.',
        // 					'Тех.П ПЗ 14 -1 Ауд 110 Синицын В.Н.   Ребров Ю.И.',
        //  				...,
        // 				]
        // 			},
        // 			...,
        // 		...,
        // 		},
        // 	...,
        //  }
        [platoonType: string]: {
            [platoon: string]: {
                [date: string]: TSchedule;
            };
        };
    };
};

class ScheduleStorage {
    private readonly _instance: TScheduleStorageInstance;

    public ScheduleStorageBuildError = createError({
        name: "ScheduleStorageBuildError",
        message: "Cannot build ScheduleStorage",
    });

    public ScheduleStorageDumpError = createError({
        name: "ScheduleStorageDumpError",
        message: "Cannot dump ScheduleStorage",
    });

    async fromDumpOrBuild(): Promise<TScheduleStorageInstance> {
        if (this._instance != null) {
            return this._instance;
        }

        const {
            schedulePath,
            parsedSchedulePath,
        } = resolveScheduleFileConfig();

        // Trying to restore existing parsed schedule from JSON on disk
        if (existsSync(parsedSchedulePath)) {
            try {
                const parsedSchedule = readFileSync(parsedSchedulePath, "utf8");
                return JSON.parse(parsedSchedule);
            } catch (exception) {
                throw exception;
            }
        }

        await this.buildSchedule(schedulePath, parsedSchedulePath);

        return this._instance;
    }

    async buildSchedule(schedulePath: string, parsedSchedulePath: string) {
        try {
            const parsedSchedule = await ScheduleParser.parse(schedulePath);
            this.dumpSchedule(parsedSchedule, parsedSchedulePath);
        } catch (exception) {
            throw new this.ScheduleStorageBuildError();
        }
    }

    dumpSchedule(
        builtSchedule: TScheduleStorageInstance,
        parsedSchedulePath: string,
    ) {
        try {
            const jsonString = JSON.stringify(builtSchedule);
            writeFileSync(parsedSchedulePath, jsonString, "utf8");
        } catch (exception) {
            throw new this.ScheduleStorageDumpError();
        }
    }
}

export default new ScheduleStorage();
