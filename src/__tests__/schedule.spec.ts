import { ScheduleStorage } from "@/modules/Schedule";
import { resolveScheduleFromPlatoon } from "@/resolvers/schedule";

import scheduleMock from "./__mocks__/schedule.mock";

describe("Schedule module", () => {
    beforeAll(() => {
        ScheduleStorage.fromDumpOrBuild({});
    });

    test("should correctly parse 2009 platoon for 27 october", () => {
        const scheduleData = resolveScheduleFromPlatoon("2009", "27 октября");
        expect(scheduleData).toEqual(scheduleMock);
    });
});
