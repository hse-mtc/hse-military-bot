export type TScheduleMetaPlatoonTypes = string[];
export type TScheduleMetaPlatoons = {
    [platoonType: string]: string[];
};
export type TScheduleMetaDates = {
    [platoon: string]: string[];
};

export type TScheduleMeta = {
    // [ "Офицеры - разведка", "Сержанты МСВ", "Офицеры ВКС", ... ],
    platoonTypes: TScheduleMetaPlatoonTypes;
    // { "Офицеры - разведка": [ "1606", "1909", ... ], "Сержанты МСВ": [Array], ... }
    platoons: TScheduleMetaPlatoons;
    // { "1701": [ "10 января", "17 января", ... ],"1702": [Array], ... }
    dates: TScheduleMetaDates;
};

export type TScheduleDayItem = {
    weekday: string;
    schedule: string[];
};

export type TSchedule = {
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
            [date: string]: TScheduleDayItem;
        };
    };
};

export type TScheduleObject = {
    meta: TScheduleMeta;
    schedule: TSchedule;
};

export { default as ScheduleParser } from "./Parser";
export { default as ScheduleStorage } from "./Storage";
export { default as ScheduleDownloader } from "./Downloader";
