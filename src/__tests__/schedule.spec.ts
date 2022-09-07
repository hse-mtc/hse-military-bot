import { ScheduleStorage } from "@/modules/Schedule";
import { resolveScheduleFromPlatoon } from "@/resolvers/schedule";

import scheduleMock from "./__mocks__/schedule.mock";

describe("Schedule module", () => {
    beforeAll(() => {
        ScheduleStorage.fromDumpOrBuild({});
    });

    test("should correctly parse 2109 platoon for 27 April", () => {
        const scheduleData = resolveScheduleFromPlatoon("2103", "5 октября");
        expect(scheduleData).toEqual(scheduleMock);
    });
});
