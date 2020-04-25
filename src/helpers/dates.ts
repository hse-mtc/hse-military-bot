import { MONTH_NAMES } from "@/constants/dateTime";

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
