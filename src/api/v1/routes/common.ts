import * as path from "path";
import { Router, Request, Response } from "express";

const commonRoutes = Router();

commonRoutes.get("/", (_req: Request, res: Response) =>
    res.sendFile(
        path.join(process.env.NODE_PATH ?? ".", "public", "index.html"),
    ),
);

commonRoutes.get("/ping", (_req: Request, res: Response) =>
    res.status(200).send("ok"),
);

export default commonRoutes;
