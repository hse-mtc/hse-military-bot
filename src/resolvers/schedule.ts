import createError from "@/helpers/createError";
import {
    ScheduleStorage,
    TScheduleStorageInstance,
    TSchedule,
} from "@/modules/Schedule";

const ScheduleFromPlatoonResolver = createError({
    name: "ScheduleFromPlatoonResolver",
    message: "ScheduleFromPlatoonResolver error",
});

export const resolveFullSchedule = async (): Promise<
    TScheduleStorageInstance
> => {
    return await ScheduleStorage.fromDumpOrBuild();
};

export const resolvePlatoonTypeFromPlatoon = async (targetPlatoon: string) => {
    let detectedPlatoonType;
    const scheduleObj = await resolveFullSchedule();

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

export const resolveScheduleFromPlatoon = async (
    platoon: string,
    date: string,
): Promise<TSchedule> => {
    const [scheduleObj, platoonType] = await Promise.all([
        resolveFullSchedule(),
        resolvePlatoonTypeFromPlatoon(platoon),
    ]);

    if (!scheduleObj || !platoonType) {
        throw new ScheduleFromPlatoonResolver();
    }

    return scheduleObj.schedule[platoonType][platoon][date];
};
