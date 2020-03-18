import createError from "@/helpers/createError";
import { TReplyFunction } from "@/helpers/types";
import { MONTH_NAMES } from "@/constants/dateTime";

const UnexistingYearError = createError({
    name: "UnexistingYearError",
    message: "UnexistingYearError should never occur",
});

const formatMinutes = (rawMinutes: number): string => {
    const minutesString = rawMinutes.toString();

    if (minutesString.length === 1) {
        return `0${rawMinutes}`;
    } else {
        return minutesString;
    }
};

export const getFormattedDate = (dateObj: Date): string => {
    const dayOfMonth = dateObj.getDate();

    const monthName = MONTH_NAMES[dateObj.getMonth()];
    const fullYear = dateObj.getFullYear();

    const hours = dateObj.getHours();
    const minutes = formatMinutes(dateObj.getMinutes());

    return `${dayOfMonth} ${monthName} ${fullYear}, ${hours}:${minutes}`;
};

// TODO: in config, or get rid of it for meta one
export const getYearIndexFromPlatoonSafe = (
    platoon: string,
    reply: TReplyFunction,
): number => {
    const year = platoon.slice(2);

    switch (year) {
        case "18":
            return 0;
        case "19":
            return 1;
        case "17":
            return 2;
        default:
            reply("Некорректный взвод");
            throw new UnexistingYearError();
    }
};
