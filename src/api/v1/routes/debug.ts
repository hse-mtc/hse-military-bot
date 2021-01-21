// import * as path from "path";
// import * as heapdump from "heapdump";
import makeError from "make-error";
// import { format } from "date-fns";
import { Router, Response, Request } from "express";

// import Logger from "@/modules/Logger";
import { authMiddleware } from "../middlewares";

const TestSentryError = makeError("TestSentryError");

const debugRoutes = Router();

debugRoutes.get("/ping", (_req: Request, res: Response) =>
    res.status(200).send("ok"),
);

// debugRoutes.get("/heapdump", [
//     authMiddleware,
//     (_req: Request, res: Response): void => {
//         const profilePath =
//             process.env.LOGS_DIR || process.env.NODE_PATH || ".";

//         const profileFilename = format(
//             new Date(),
//             `${global.process.pid}_yyyy-MM-ddTHH:mm:ss`,
//         );

//         const filename = path.join(
//             profilePath,
//             `${profileFilename}.heapsnapshot`,
//         );

//         res.status(200).send("Snapshot dump is successfully queried");

//         heapdump.writeSnapshot(filename, (err, name) =>
//             err
//                 ? Logger.error(err)
//                 : Logger.info(`Heap dump snapshot: ${name}`),
//         );
//     },
// ]);

debugRoutes.get("/debugSentry", [
    authMiddleware,
    (): void => {
        throw new TestSentryError("Test Sentry error!");
    },
]);

export default debugRoutes;
