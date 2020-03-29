import {
    ScheduleStorage,
    TScheduleObject,
    TScheduleDayItem,
    TScheduleMeta,
} from "@/modules/Schedule";
import BaseError from "@/modules/BaseError";

const ScheduleFromPlatoonResolverError = BaseError.createErrorGenerator(
    "ScheduleFromPlatoonResolverError",
);

export const resolveFullSchedule = (): TScheduleObject =>
    ScheduleStorage.instanсe;

export const resolveScheduleMeta = (): TScheduleMeta =>
    resolveFullSchedule().meta;

export const resolvePlatoonTypeFromPlatoon = (
    targetPlatoon: string,
): string | undefined => {
    let detectedPlatoonType;
    const scheduleObj = resolveFullSchedule();

    for (const [platoonType, platoons] of Object.entries(
        scheduleObj.meta.platoons,
    )) {
        for (const platoon of platoons) {
            if (platoon === targetPlatoon) {
                detectedPlatoonType = platoonType;
            }
        }
    }

    return detectedPlatoonType;
};

export const resolveScheduleFromPlatoon = (
    platoon: string,
    date: string,
): TScheduleDayItem => {
    const scheduleObj = resolveFullSchedule();
    const platoonType = resolvePlatoonTypeFromPlatoon(platoon);

    if (!scheduleObj || !platoonType) {
        throw ScheduleFromPlatoonResolverError(
            "ScheduleFromPlatoonResolverError occured",
        );
    }

    return scheduleObj.schedule[platoonType][platoon][date];
};
