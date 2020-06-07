import {
    ScheduleStorage,
    TScheduleObject,
    TScheduleDayItem,
    TScheduleMeta,
} from "@/modules/Schedule";
import makeError from "make-error";

const ScheduleFromPlatoonResolverError = makeError(
    "ScheduleFromPlatoonResolverError",
);

const AvailableDatesFromPlatoonResolverError = makeError(
    "AvailableDatesFromPlatoonResolverError",
);

export const resolveFullSchedule = (): TScheduleObject =>
    ScheduleStorage.instanсe;

export const resolveScheduleMeta = (): TScheduleMeta =>
    resolveFullSchedule().meta;

export const resolvePlatoonTypes = (): string[] =>
    resolveScheduleMeta().platoonTypes;

export const resolvePlatoons = (): string[] =>
    Object.values(resolveScheduleMeta().platoons).reduce(
        (result, platoons) => [...result, ...platoons],
        [],
    );

export const resolvePlatoonTypeFromPlatoon = (
    targetPlatoon: string,
): string | undefined => {
    let detectedPlatoonType;
    const scheduleMeta = resolveScheduleMeta();

    for (const [platoonType, platoons] of Object.entries(
        scheduleMeta.platoons,
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
        throw new ScheduleFromPlatoonResolverError(
            "ScheduleFromPlatoonResolverError occured",
        );
    }

    return scheduleObj.schedule[platoonType][platoon][date];
};

export const resolvePlatoonsFromPlatoonType = (
    platoonType: string,
): string[] => {
    const scheduleMeta = resolveScheduleMeta();

    if (!scheduleMeta || !platoonType) {
        throw new ScheduleFromPlatoonResolverError(
            "ScheduleFromPlatoonResolverError occured",
        );
    }

    return scheduleMeta.platoons[platoonType];
};

export const resolveAvailableDatesFromPlatoon = (platoon: string): string[] => {
    const scheduleMeta = resolveScheduleMeta();

    if (!scheduleMeta || !platoon) {
        throw new AvailableDatesFromPlatoonResolverError(
            "AvailableDatesFromPlatoonResolverError occured",
        );
    }

    return scheduleMeta.dates[platoon];
};
