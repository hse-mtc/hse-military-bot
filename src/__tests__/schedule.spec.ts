import { resolveScheduleFromPlatoon } from "@/resolvers/schedule";

import scheduleMock from "./__mocks__/schedule.mock";

describe("Schedule module", () => {
    test("should correctly parse 1809 platoon for 15 january", async () => {
        const scheduleData = await resolveScheduleFromPlatoon(
            "1809",
            "15 января",
        );
        expect(scheduleData).toEqual(scheduleMock);
    });
});
