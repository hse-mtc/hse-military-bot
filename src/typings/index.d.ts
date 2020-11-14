import { Request } from "express";

import { Middleware } from "telegraf/typings/composer";
import { SceneContextMessageUpdate } from "telegraf/typings/stage";
import { ExtraReplyMessage, Message } from "telegraf/typings/telegram-types";

export interface CustomRequest<T> extends Request {
    body: T;
}

export type ReplyFunction = (
    text: string,
    extra?: ExtraReplyMessage,
) => Promise<Message>;

export type ReplyOrChangeScene =
    | Message
    | Middleware<SceneContextMessageUpdate>;

export type SceneHandler<T = Record<string, unknown>> = (
    ctx: SceneContextMessageUpdate & {
        session: T;
    },
) => Promise<ReplyOrChangeScene>;
