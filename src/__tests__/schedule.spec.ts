import { ScheduleStorage } from "@/modules/Schedule";
import { resolveScheduleFromPlatoon } from "@/resolvers/schedule";

import scheduleMock from "./__mocks__/schedule.mock";

describe("Schedule module", () => {
    beforeAll(() => {
        ScheduleStorage.fromDumpOrBuild({});
    });

    test("should correctly parse 1809 platoon for 15 january", () => {
        const scheduleData = resolveScheduleFromPlatoon("2009", "25 февраля");
        expect(scheduleData).toEqual(scheduleMock);
    });
});
