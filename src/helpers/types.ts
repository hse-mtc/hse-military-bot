import * as tt from "telegraf/typings/telegram-types";

import { Request } from "express";

export interface ICustomRequest<T> extends Request {
    body: T;
}

export type TReplyFunction = (
    text: string,
    extra?: tt.ExtraReplyMessage,
) => Promise<tt.Message>;
