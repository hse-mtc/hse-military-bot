import * as path from "path";

export type TFirebaseConfig = {
    databaseURL: string;
    projectId: string;
    clientEmail: string;
    privateKey: string;
};

export const resolveFirebaseConfigSync = (
    databaseName: "users" | "schedule",
): TFirebaseConfig =>
    databaseName === "users"
        ? {
              databaseURL: process.env.FIREBASE_USERS_URL || "",
              projectId: process.env.FIREBASE_USERS_PROJECT_ID || "",
              clientEmail: process.env.FIREBASE_USERS_CLIENT_EMAIL || "",
              privateKey: (
                  process.env.FIREBASE_USERS_PRIVATE_KEY || ""
              ).replace(/\\n/g, "\n"),
          }
        : {
              databaseURL: process.env.FIREBASE_SCHEDULE_URL || "",
              projectId: process.env.FIREBASE_SCHEDULE_PROJECT_ID || "",
              clientEmail: process.env.FIREBASE_SCHEDULE_CLIENT_EMAIL || "",
              privateKey: (
                  process.env.FIREBASE_SCHEDULE_PRIVATE_KEY || ""
              ).replace(/\\n/g, "\n"),
          };

export const resolveEnvironmentSync = () => ({
    env: process.env.NODE_ENV || "development",
    port: process.env.PORT || 3000,
    url: process.env.HEROKU_URL || "",
});

export const resolveBotConfigSync = () => ({
    token: process.env.BOT_TOKEN || "",
});

export const resolveMetricaConfigSync = () => ({
    token: process.env.METRICA_TOKEN || "",
    counter: process.env.METRICA_COUNTER || "",
    host: "hse-military-bot.herokuapp.com",
    path: "/",
    pageTitle: "hse-military-bot",
});

export const resolveScheduleFileConfig = (): {
    schedulePath: string;
    parsedSchedulePath: string;
} => ({
    schedulePath: path.join(__dirname, "../static/schedule.xlsx"),
    parsedSchedulePath: path.join(__dirname, "../static/parsedSchedule.json"),
});
