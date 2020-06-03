import { Router, Response } from "express";

import resolveNewsArticles from "@/resolvers/news";
import { CustomRequest } from "@/typings/custom";

import { authMiddleware } from "../middlewares";

const newsRoutes = Router();

type TGetNewsRequestBody = {
    topic: string;
    num?: number;
};

// TODO: fix num, get rid of id and use page
newsRoutes.post("/getNews", [
    authMiddleware,
    async (
        req: CustomRequest<TGetNewsRequestBody>,
        res: Response,
    ): Promise<void> => {
        const { topic, num } = req.body;

        if (!topic) {
            res.status(400).send("'page' and 'topic' should be provided");
            return;
        }

        if (typeof topic !== "string") {
            res.status(400).send("'topic' should be 'string'");
            return;
        }

        if (typeof num !== "number") {
            res.status(400).send("'num' should be 'number'");
            return;
        }

        res.status(200).send(await resolveNewsArticles(topic, num));
    },
]);

export default newsRoutes;
