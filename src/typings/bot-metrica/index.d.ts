declare module "bot-metrica" {
    type BotMetricaConfig = {
        host: string;
        path: string;
        token: string;
        pageTitle: string;
    };

    export type MetricaTrackFunction = {
        track(fromId: number, message: string, goal: string): void;
    };

    export default function BotMetrica(
        counter: string,
        config: BotMetricaConfig,
    ): MetricaTrackFunction;
}
