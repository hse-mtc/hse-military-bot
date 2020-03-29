import { Router, Response, Request } from "express";
import {
    resolveFullSchedule,
    resolveScheduleMeta,
    resolveScheduleFromPlatoon,
    resolvePlatoonTypeFromPlatoon,
} from "@/resolvers/schedule";
import { CustomRequest } from "@/typings/custom";
import { authMiddleware } from "../middlewares";

const scheduleRoutes = Router();

scheduleRoutes.get("/getFullSchedule", [
    authMiddleware,
    (_req: Request, res: Response): void => {
        res.status(200).send(resolveFullSchedule());
    },
]);

scheduleRoutes.get("/getScheduleMeta", [
    authMiddleware,
    (_req: Request, res: Response): void => {
        res.status(200).send(resolveScheduleMeta());
    },
]);

type TGetScheduleForPlatoonRequestBody = {
    date: string;
    platoon: string;
};

// TODO: use validators
scheduleRoutes.post("/getScheduleForPlatoon", [
    authMiddleware,
    (
        req: CustomRequest<TGetScheduleForPlatoonRequestBody>,
        res: Response,
    ): void => {
        const { platoon, date } = req.body;

        if (!platoon || !date) {
            res.status(400).send("'platoon' and 'date' should be provided");
            return;
        }

        res.status(200).send(resolveScheduleFromPlatoon(platoon, date));
    },
]);

type TGetPlatoonTypeForPlatoonRequestBody = {
    platoon: string;
};

// TODO: use validators
scheduleRoutes.post("/getPlatoonTypeForPlatoon", [
    authMiddleware,
    (
        req: CustomRequest<TGetPlatoonTypeForPlatoonRequestBody>,
        res: Response,
    ): void => {
        const { platoon } = req.body;

        if (!platoon) {
            res.status(400).send("'platoon' should be provided");
            return;
        }

        res.status(200).send(resolvePlatoonTypeFromPlatoon(platoon));
    },
]);

// TODO
// scheduleRoutes.post('/updateSchedule', (_req, res) => res.status(200).send('ok'));

export default scheduleRoutes;
