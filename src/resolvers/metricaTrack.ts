import Metrica from "@/modules/Metrica";
import createError from "@/helpers/createError";

const MetricaTrackResolverError = createError({
    name: "MetricaTrackResolverError",
    message: "Error occurred in metricaTrack resolver",
});

export default function track(fromId: number, message: string, goal: string) {
    try {
        Metrica.instance.track(fromId, message, goal);
    } catch (exception) {
        throw new MetricaTrackResolverError();
    }
}
