declare module "bot-metrica" {
    type TBotMetricaConfig = {
        host: string;
        path: string;
        token: string;
        pageTitle: string;
    };

    export type TMetricaTrackFunction = {
        track(fromId: number, message: string, goal: string): void;
    };

    export default function BotMetrica(
        counter: string,
        config: TBotMetricaConfig,
    ): TMetricaTrackFunction;
}
