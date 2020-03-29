import * as tt from "telegraf/typings/telegram-types";
import { ContextMessageUpdate, Markup, Stage } from "telegraf";

import BaseError from "@/modules/BaseError";
import track from "@/resolvers/metricaTrack";
import { MENU_SCENARIO } from "@/constants/scenarios";
import { MILITARY_STICKER_ID } from "@/constants/configuration";
import { TReplyFunction } from "@/typings/custom";

const { inlineKeyboard, urlButton } = Markup;

const EnsureFromIdError = BaseError.createErrorGenerator("EnsureFromIdError");
const EnsureMessageError = BaseError.createErrorGenerator("EnsureMessageError");

export const ensureFromId = async (
    from: tt.User | undefined,
    reply: TReplyFunction,
): Promise<number> => {
    if (!from) {
        await reply("Метод не поддерживается");
        Stage.enter(MENU_SCENARIO.MAIN_SCENE);
    }

    if (!(from && from.id)) {
        throw EnsureFromIdError("EnsureFromIdError should never occur");
    }

    return from.id;
};

export const ensureMessageText = async (
    message: tt.Message | undefined,
    reply: TReplyFunction,
): Promise<string> => {
    if (!message) {
        await reply("Метод не поддерживается");
        Stage.enter(MENU_SCENARIO.MAIN_SCENE);
    }

    if (!(message && message.text)) {
        throw EnsureMessageError("EnsureMessageError should never occur");
    }

    return message.text;
};

export const ensureFromIdAndMessageText = (
    from: tt.User | undefined,
    message: tt.Message | undefined,
    reply: TReplyFunction,
): Promise<[number, string]> =>
    Promise.all([ensureFromId(from, reply), ensureMessageText(message, reply)]);

export const handleStickerButton = async ({
    from,
    reply,
    replyWithSticker,
}: ContextMessageUpdate): Promise<tt.MessageSticker | tt.Message> => {
    const fromId = await ensureFromId(from, reply);
    track(fromId, "Стикерпак", "Выбран стикерпак");

    const button = urlButton(
        "Полный стикерпак",
        "https://t.me/addstickers/HseArmy",
        false,
    );
    return replyWithSticker(
        MILITARY_STICKER_ID,
        inlineKeyboard([button]).extra(),
    );
};
