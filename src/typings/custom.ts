import * as telegraf from "telegraf";
import * as tt from "telegraf/typings/telegram-types";

import { Request } from "express";

export interface CustomRequest<T> extends Request {
    body: T;
}

export type TReplyFunction = (
    text: string,
    extra?: tt.ExtraReplyMessage,
) => Promise<tt.Message>;

export type TReplyOrChangeScene =
    | tt.Message
    | telegraf.Middleware<telegraf.SceneContextMessageUpdate>;
