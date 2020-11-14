export type ScheduleMetaPlatoonTypes = string[];
export type ScheduleMetaPlatoons = {
    [platoonType: string]: string[];
};
export type ScheduleMetaDates = {
    [platoon: string]: string[];
};

export type ScheduleMeta = {
    // [ "Офицеры - разведка", "Сержанты МСВ", "Офицеры ВКС", ... ],
    platoonTypes: ScheduleMetaPlatoonTypes;
    // { "Офицеры - разведка": [ "1606", "1909", ... ], "Сержанты МСВ": [Array], ... }
    platoons: ScheduleMetaPlatoons;
    // { "1701": [ "10 января", "17 января", ... ],"1702": [Array], ... }
    dates: ScheduleMetaDates;
};

export type ScheduleDayItem = {
    weekday: string;
    schedule: string[];
};

export type Schedule = {
    // {
    // 	"Офицеры - разведка": {
    // 		"1703": {
    // 			"10 января": {
    // 				"weekday": "Пятница",
    // 				"schedule": [
    // 					"Тех.П ПЗ 14 -1 Ауд 110 Синицын В.Н.   Ребров Ю.И.",
    // 					"Тех.П ПЗ 14 -1 Ауд 110 Синицын В.Н.   Ребров Ю.И.",
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
            [date: string]: ScheduleDayItem;
        };
    };
};

export type ScheduleObject = {
    meta: ScheduleMeta;
    schedule: Schedule;
};

export { default as ScheduleParser } from "./Parser";
export { default as ScheduleStorage } from "./Storage";
export { default as ScheduleDownloader } from "./Downloader";
