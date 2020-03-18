import * as path from "path";
import * as heapdump from "heapdump";
import { format } from "date-fns";
import { Router, Response, Request } from "express";

import Logger from "@/modules/Logger";
import { authMiddleware } from "../middlewares";

const debugRoutes = Router();

// TODO: Починить билд хипдампа
debugRoutes.get("/heapdump", [
    authMiddleware,
    (req: Request, res: Response) => {
        const profilePath = global.process.env.LOGS_DIR || global.process.cwd();

        const profileFilename = format(
            `${global.process.pid}_YYYY-MM-DDTHH:mm:ss`,
        );

        const filename = path.join(
            profilePath,
            `${profileFilename}.heapsnapshot`,
        );

        heapdump.writeSnapshot(filename, (err, name) =>
            err
                ? Logger.error(err)
                : Logger.info(`Heap dump snapshot: ${name}`),
        );

        return res.status(200).send("Snapshot dump is successfully queried");
    },
]);

export default debugRoutes;
