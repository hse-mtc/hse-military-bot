import * as tt from "telegraf/typings/telegram-types";
import { ContextMessageUpdate, Markup, Stage } from "telegraf";

import track from "@/resolvers/metricaTrack";
import { TReplyFunction } from "@/helpers/types";
import createError from "@/helpers/createError";
import { MENU_SCENARIO } from "@/constants/scenarios";
import { MILITARY_STICKER_ID } from "@/constants/configuration";

const { inlineKeyboard, urlButton } = Markup;

const EnsureFromIdError = createError({
    name: "EnsureFromIdError",
    message: "EnsureFromIdError should never occur",
});

const EnsureMessageError = createError({
    name: "EnsureMessageError",
    message: "EnsureMessageError should never occur",
});

export const ensureFromId = async (
    from: tt.User | undefined,
    reply: TReplyFunction,
): Promise<number> => {
    if (!from) {
        await reply("Метод не поддерживается");
        Stage.enter(MENU_SCENARIO.MAIN_SCENE);
    }

    if (!(from && from.id)) {
        throw new EnsureFromIdError();
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
        throw new EnsureMessageError();
    }

    return message.text;
};

export const ensureFromIdAndMessageText = (
    from: tt.User | undefined,
    message: tt.Message | undefined,
    reply: TReplyFunction,
) =>
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
