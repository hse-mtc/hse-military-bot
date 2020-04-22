import { Application } from "express";

import commonRoutes from "./common";
import newsRoutes from "./news";
import scheduleRoutes from "./schedule";
import debugRoutes from "./debug";

export default function setupRoutes(app: Application): void {
    app.use(commonRoutes);
    app.use(scheduleRoutes);
    app.use(newsRoutes);
    app.use(debugRoutes);
}
