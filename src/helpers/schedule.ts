import { CellValue, Worksheet } from "exceljs";

import { popSimilarValues } from "@/helpers/general";

type ColumnDates = {
    col: number;
    value: CellValue;
}[];

type ColorPalette = {}[];

export const getAllCellsFromRow = (
    worksheet: Worksheet,
    rowIndeces: number[],
    startingColumn = 1,
): { row: number; dates: ColumnDates } => {
    const arr = [];

    rowIndeces.forEach((item) => {
        const arrForEachRow: ColumnDates = [];

        worksheet.getRow(item).eachCell((cell, colNumber) => {
            if (colNumber >= startingColumn) {
                arrForEachRow.push({ col: colNumber, value: cell.value });
            }
        });

        arr.push({ row: item, dates: arrForEachRow });
    });

    return arr;
};

export const getCellFromRowAndColumn = (
    worksheet: Worksheet,
    rowIndex: number,
    columnIndex: number,
) => {
    return worksheet.getRow(rowIndex).getCell(columnIndex).value;
};

export const getColorFromRowAndColumn = (
    worksheet: Worksheet,
    rowIndex: number,
    columnIndex: number,
) => {
    const { style } = worksheet.getRow(rowIndex).getCell(columnIndex);
    // const hasFgColor = fill && fill.fgColor.indexed;

    if (style.fill && style.fill.type === "pattern" && style.fill.fgColor) {
        return worksheet.getRow(rowIndex).getCell(columnIndex).fill.fgColor
            .indexed;
    }

    return false;
};

export const getAllActiveIndeces = (
    worksheet: Worksheet,
    column: number,
    trigger,
) => {
    const arr = [];

    worksheet.getColumn(column).eachCell((cell, rowNumber) => {
        if (cell.value) {
            if (cell.value === trigger) {
                return;
            }
            arr.push(rowNumber);
        }
    });

    return arr;
};

export const getTrainingsColorPalette = (
    worksheet: Worksheet,
    column: number,
) => {
    const colorPalette: ColorPalette = [];

    worksheet.getColumn(column).eachCell((cell, rowNumber) => {
        if (cell.fill && cell.fill.fgColor.indexed) {
            colorPalette.push({
                index: cell.fill.fgColor.indexed,
                value: worksheet.getRow(rowNumber).getCell(column + 2).value,
            });
        }
    });

    return colorPalette;
};

export const getColumnIndecesContainingString = (
    worksheet: Worksheet,
    str: string,
): number[] => {
    let tmpValue: CellValue;
    const targetColumnNumber: number[] = [];

    worksheet.eachRow((row) => {
        row.eachCell((cell, colNumber) => {
            if (tmpValue) {
                if (cell.value === str) {
                    targetColumnNumber.push(colNumber);
                }
            }
            tmpValue = cell.value;
        });
    });

    return popSimilarValues(targetColumnNumber);
};

export const getRowIndecesContainingString = (
    worksheet: Worksheet,
    str: string,
): number[] => {
    let tmpValue: CellValue;
    const targetColumnNumber: number[] = [];

    worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
            if (tmpValue) {
                if (cell.value === str) {
                    targetColumnNumber.push(rowNumber);
                }
            }
            tmpValue = cell.value;
        });
    });

    return targetColumnNumber;
};

export const hasOnlyValuesFromArray = <T>(
    array: T[],
    triggers: T[],
): boolean => {
    let counter = 0;

    array.forEach((item) => {
        triggers.forEach((trigger) => {
            if (item === trigger) counter++;
        });
    });

    return counter === array.length;
};
