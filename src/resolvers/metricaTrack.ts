import Metrica from "@/modules/Metrica";
import BaseError from "@/modules/BaseError";

const MetricaTrackResolverError = BaseError.createErrorGenerator(
    "MetricaTrackResolverError",
);

export default function track(
    fromId: number,
    message: string,
    goal: string,
): void {
    try {
        Metrica.instance.track(fromId, message, goal);
    } catch (exception) {
        throw MetricaTrackResolverError(
            "Error occurred in metricaTrack resolver",
        );
    }
}
