import * as path from "path";
import * as heapdump from "heapdump";
import { format } from "date-fns";
import { Router, Response, Request } from "express";

import Logger from "@/modules/Logger";
import { authMiddleware } from "../middlewares";

const debugRoutes = Router();

debugRoutes.get("/heapdump", [
    authMiddleware,
    (_req: Request, res: Response): void => {
        const profilePath =
            process.env.LOGS_DIR || process.env.NODE_PATH || ".";

        const profileFilename = format(
            new Date(),
            `${global.process.pid}_YYYY-MM-DDTHH:mm:ss`,
        );

        const filename = path.join(
            profilePath,
            `${profileFilename}.heapsnapshot`,
        );

        res.status(200).send("Snapshot dump is successfully queried");

        heapdump.writeSnapshot(filename, (err, name) =>
            err
                ? Logger.error(err)
                : Logger.info(`Heap dump snapshot: ${name}`),
        );
    },
]);

export default debugRoutes;
