import makeError from "make-error";
import Metrica from "@/modules/Metrica";

const MetricaTrackResolverError = makeError("MetricaTrackResolverError");

export default function track(
    fromId: number,
    message: string,
    goal: string,
): void {
    try {
        Metrica.instance.track(fromId, message, goal);
    } catch (exception) {
        throw new MetricaTrackResolverError(
            "Error occurred in metricaTrack resolver",
        );
    }
}
