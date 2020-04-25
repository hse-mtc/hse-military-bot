import { Request } from "express";

import { Middleware } from "telegraf/typings/composer";
import { SceneContextMessageUpdate } from "telegraf/typings/stage";
import { ExtraReplyMessage, Message } from "telegraf/typings/telegram-types";

export interface CustomRequest<T> extends Request {
    body: T;
}

export type TReplyFunction = (
    text: string,
    extra?: ExtraReplyMessage,
) => Promise<Message>;

export type TReplyOrChangeScene =
    | Message
    | Middleware<SceneContextMessageUpdate>;

export type SceneHandler<T = {}> = (
    ctx: SceneContextMessageUpdate & {
        session: T;
    },
) => Promise<TReplyOrChangeScene>;
