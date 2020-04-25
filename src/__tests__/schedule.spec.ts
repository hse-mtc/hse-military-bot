import { ScheduleStorage } from "@/modules/Schedule";
import { resolveScheduleFromPlatoon } from "@/resolvers/schedule";

import scheduleMock from "./__mocks__/schedule.mock";

describe("Schedule module", () => {
    beforeAll(() => {
        ScheduleStorage.fromDumpOrBuild();
    });

    test("should correctly parse 1809 platoon for 15 january", () => {
        const scheduleData = resolveScheduleFromPlatoon("1809", "15 января");
        expect(scheduleData).toEqual(scheduleMock);
    });
});
