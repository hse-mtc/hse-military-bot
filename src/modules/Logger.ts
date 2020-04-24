import { transports, format } from "winston";
import { logger as expressLogger } from "express-winston";

const { combine, simple, timestamp, splat, printf, colorize } = format;

// const LOGGER_OPTIONS = {
//     transports: [new transports.Console({ level: "debug" })],
//     format: combine(
//         simple(),
//         timestamp(),
//         errors({ stack: true }),
//         splat(),
//         printf(
//             ({ timestamp: time, level, message, meta }) =>
//                 `${time}\t${level}\t${message}\t${
//                     meta ? JSON.stringify(meta) : ""
//                 }`,
//         ),
//         colorize(),
//     ),
//     colorize: true,
// };

// TODO: typings
const EXPRESS_LOGGER_OPTIONS = {
    transports: [new transports.Console({ level: "debug" })],
    format: combine(
        simple(),
        timestamp(),
        splat(),
        printf(
            ({ timestamp: time, level, message, meta }) =>
                `${time}\t${level}\t${message}\t${
                    meta ? JSON.stringify(meta) : ""
                }`,
        ),
        colorize(),
    ),
    msg:
        "HTTP {{req.method}}\t{{req.url}}\t{{res.statusCode}}\t{{res.responseTime}}",
    colorize: true,
};

// export default createLogger(LOGGER_OPTIONS);
export default console;

export const ExpressLogger = expressLogger(EXPRESS_LOGGER_OPTIONS);
