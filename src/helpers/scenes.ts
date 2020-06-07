import makeError from "make-error";
import * as tt from "telegraf/typings/telegram-types";
import { Markup, Stage, Extra } from "telegraf";

import { TelegrafContext } from "telegraf/typings/context";
import { SceneContextMessageUpdate } from "telegraf/typings/stage";

import track from "@/resolvers/metricaTrack";
import { MENU_SCENARIO } from "@/constants/scenarios";
import { MILITARY_STICKER_ID } from "@/constants/configuration";
import { TReplyFunction } from "@/typings/custom";

const { inlineKeyboard, urlButton } = Markup;

const EnsureFromIdError = makeError("EnsureFromIdError");
const EnsureMessageError = makeError("EnsureMessageError");

export const ensureFromId = (
    from: tt.User | undefined,
    reply: TReplyFunction,
): number => {
    if (!from) {
        reply("Метод не поддерживается");
        Stage.enter(MENU_SCENARIO.MAIN_SCENE);
    }

    if (!(from && from.id)) {
        throw new EnsureFromIdError("EnsureFromIdError should never occur");
    }

    return from.id;
};

export const ensureMessageText = (
    message: tt.Message | undefined,
    reply: TReplyFunction,
): string => {
    if (!message) {
        reply("Метод не поддерживается");
        Stage.enter(MENU_SCENARIO.MAIN_SCENE);
    }

    if (!(message && message.text)) {
        throw new EnsureMessageError("EnsureMessageError should never occur");
    }

    return message.text;
};

export const ensureFromIdAndMessageText = (
    from: tt.User | undefined,
    message: tt.Message | undefined,
    reply: TReplyFunction,
): [number, string] => [
    ensureFromId(from, reply),
    ensureMessageText(message, reply),
];

export const handleStickerButton = async ({
    from,
    reply,
    replyWithSticker,
}: TelegrafContext): Promise<tt.MessageSticker | tt.Message> => {
    const fromId = ensureFromId(from, reply);
    track(fromId, "Стикерпак", "Выбран стикерпак");

    const button = urlButton(
        "Полный стикерпак",
        "https://t.me/addstickers/HseArmy",
        false,
    );
    return replyWithSticker(
        MILITARY_STICKER_ID,
        // TODO: get rid of as
        inlineKeyboard([button]).extra() as tt.ExtraSticker,
    );
};

export const handleUnhandledMessageDefault = ({
    reply,
}: SceneContextMessageUpdate): Promise<tt.Message> =>
    reply(
        "Выберите существующий пункт меню, или вернитесь в главное меню",
        Extra.markup(Markup.resize(true)),
    );

export const makeKeyboardColumns = (
    controls: string[],
    numOfColumns: number,
): string[][] => {
    return controls.reduce((result: string[][], platoonDateControl, index) => {
        if (index === 0 || result[result.length - 1].length >= numOfColumns) {
            result.push([]);
        }

        result[result.length - 1].push(platoonDateControl);
        return result;
    }, []);
};
