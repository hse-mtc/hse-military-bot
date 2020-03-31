declare module "telegraf-logger" {
    import { ContextMessageUpdate } from "telegraf";

    type TOptions = {
        log: Function;
        format?: string;
        contentLength?: number;
    };

    type TMiddlewareFunction = (
        ctx: ContextMessageUpdate,
        next?: (() => any) | undefined,
    ) => any;

    export default class BotMetrica {
        constructor(options: TOptions);

        middleware(): TMiddlewareFunction;
    }
}
