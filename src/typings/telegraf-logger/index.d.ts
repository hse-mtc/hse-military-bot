declare module "telegraf-logger" {
    import { Middleware } from "telegraf";
    import { TelegrafContext } from "telegraf/typings/context";

    type TOptions = {
        log: Function;
        format?: string;
        contentLength?: number;
    };

    export default class BotMetrica {
        constructor(options: TOptions);

        middleware(): Middleware<TelegrafContext>;
    }
}
