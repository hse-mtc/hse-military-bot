import BotMetrica, { TMetricaTrackFunction } from "bot-metrica";

import createError from "@/helpers/createError";
import { resolveMetricaConfigSync } from "@/resolvers/config";

class Metrica {
    private _instance: TMetricaTrackFunction;

    get instance() {
        return this._instance;
    }

    public MetricaInitError = createError({
        name: "MetricaInitError",
        message: "Cannot initialize BotMetrica",
    });

    setup() {
        const { counter, ...config } = resolveMetricaConfigSync();

        // TODO: capture the whole error! (ReferenceError)
        try {
            this._instance = BotMetrica(counter, config);
        } catch (exception) {
            throw new this.MetricaInitError();
        }
    }
}

export default new Metrica();
