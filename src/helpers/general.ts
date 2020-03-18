export const head = <T>(arr: T[]): T => arr[0];

export const popSimilarValues = <T>(array: T[]): T[] =>
    Array.from(new Set<T>(array));
