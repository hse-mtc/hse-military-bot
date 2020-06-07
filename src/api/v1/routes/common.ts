import * as path from "path";
import { Router, Request, Response } from "express";

const commonRoutes = Router();

commonRoutes.get("/", (_req: Request, res: Response) =>
    res.sendFile(
        path.join(process.env.NODE_PATH ?? ".", "public", "index.html"),
    ),
);

export default commonRoutes;
