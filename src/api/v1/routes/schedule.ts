import { Router, Response, Request } from "express";

import {
    resolveFullSchedule,
    resolveScheduleFromPlatoon,
    resolvePlatoonTypeFromPlatoon,
} from "@/resolvers/schedule";
import { ICustomRequest } from "@/helpers/types";

import { authMiddleware } from "../middlewares";

const scheduleRoutes = Router();

// TODO: use validators
// TODO: handle errors
scheduleRoutes.get("/getFullSchedule", [
    authMiddleware,
    async (_req: Request, res: Response) => {
        const scheduleData = await resolveFullSchedule();

        return res.status(200).send(scheduleData);
    },
]);

type TGetScheduleForPlatoonRequestBody = {
    date: string;
    platoon: string;
};

// TODO: use validators
scheduleRoutes.post("/getScheduleForPlatoon", [
    authMiddleware,
    async (
        req: ICustomRequest<TGetScheduleForPlatoonRequestBody>,
        res: Response,
    ) => {
        const { platoon, date } = req.body;

        if (!platoon || !date) {
            return res
                .status(400)
                .send("'platoon' and 'date' should be provided");
        }

        // TODO: log errors
        const scheduleData = await resolveScheduleFromPlatoon(platoon, date);

        return res.status(200).send(scheduleData);
    },
]);

type TGetPlatoonTypeForPlatoonRequestBody = {
    platoon: string;
};

// TODO: use validators
scheduleRoutes.post("/getPlatoonTypeForPlatoon", [
    authMiddleware,
    async (
        req: ICustomRequest<TGetPlatoonTypeForPlatoonRequestBody>,
        res: Response,
    ) => {
        const { platoon } = req.body;

        if (!platoon) {
            return res.status(400).send("'platoon' should be provided");
        }

        // TODO: log errors
        const scheduleData = await resolvePlatoonTypeFromPlatoon(platoon);

        return res.status(200).send(scheduleData);
    },
]);

// TODO
// scheduleRoutes.post('/updateSchedule', (_req, res) => res.status(200).send('ok'));

export default scheduleRoutes;
