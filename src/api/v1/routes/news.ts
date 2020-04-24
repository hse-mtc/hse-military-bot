import { Router, Response } from "express";

import resolveNewsArticles from "@/resolvers/news";
import { CustomRequest } from "@/typings/custom";

import { authMiddleware } from "../middlewares";

const newsRoutes = Router();

type TGetNewsRequestBody = {
    topic: string;
    page?: number;
};

newsRoutes.get("/getNews", [
    authMiddleware,
    (req: CustomRequest<TGetNewsRequestBody>, res: Response): void => {
        const { page, topic } = req.body;

        if (!topic) {
            res.status(400).send("'num' and 'topic' should be provided");
            return;
        }

        if (typeof topic !== "string") {
            res.status(400).send("'topic' should be 'string'");
            return;
        }

        // if (typeof num !== undefined && typeof num !== "number") {
        //     res.status(400).send("'num' should be 'number'");
        //     return;
        // }

        res.status(200).send(resolveNewsArticles(topic, page));
    },
]);

export default newsRoutes;
