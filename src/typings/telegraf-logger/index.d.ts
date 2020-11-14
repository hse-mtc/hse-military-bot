declare module "telegraf-logger" {
    import { Middleware } from "telegraf";
    import { TelegrafContext } from "telegraf/typings/context";

    type Options = {
        log: () => void;
        format?: string;
        contentLength?: number;
    };

    export default class BotMetrica {
        constructor(options: Options);

        middleware(): Middleware<TelegrafContext>;
    }
}
