import BotMetrica, { TMetricaTrackFunction } from "bot-metrica";

import BaseError from "@/modules/BaseError";
import { resolveMetricaConfigSync } from "@/resolvers/config";

// TODO: all errors унести from classes
const MetricaInitError = BaseError.createError("MetricaInitError");

class Metrica {
    private _instance: TMetricaTrackFunction;

    get instance(): TMetricaTrackFunction {
        return this._instance;
    }

    setup(): void {
        const { counter, ...config } = resolveMetricaConfigSync();

        // TODO: capture the whole error! (ReferenceError)
        try {
            this._instance = BotMetrica(counter, config);
        } catch (exception) {
            throw MetricaInitError("Cannot initialize BotMetrica");
        }
    }
}

export default new Metrica();
