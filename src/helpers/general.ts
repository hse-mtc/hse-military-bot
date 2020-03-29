export const head = <T>(arr: T[]): T => arr[0];

export const popSimilarValues = <T>(array: T[]): T[] =>
    Array.from(new Set<T>(array));

export const capitalizeFirstLetter = (str: string): string =>
    str[0].toUpperCase() + str.slice(1);
