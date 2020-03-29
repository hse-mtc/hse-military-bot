import { Workbook, Worksheet, CellValue, CellRichTextValue } from "exceljs";

import {
    getAllActiveIndeces,
    getAllCellsFromRow,
    getCellFromRowAndColumn,
    getColorFromRowAndColumn,
    getColumnIndecesContainingString,
    getRowIndecesContainingString,
    getTrainingsColorPalette,
    hasOnlyValuesFromArray,
} from "@/helpers/schedule";
import { head, capitalizeFirstLetter } from "@/helpers/general";
import BaseError from "@/modules/BaseError";

import {
    TSchedule,
    TScheduleMeta,
    TScheduleObject,
    TScheduleMetaPlatoonTypes,
    TScheduleMetaPlatoons,
    TScheduleMetaDates,
} from ".";

const ScheduleParserError = BaseError.createErrorGenerator(
    "ScheduleParserError",
);

// A bunch of legacy, that I was too lazy to refactor, sorry ¯\_(ツ)_/¯
class ScheduleParser {
    /* Triggers for Excel table columns detection */
    private _excelTriggers = {
        platoonType: "ВУС",
        platoon: "Учебный взвод",
        weekday: "День недели",
        date: "1-я неделя",
        trainings: "Тренировки:",
    };

    private _buildMeta(scheduleObj: TSchedule): TScheduleMeta {
        const platoonTypesMeta: TScheduleMetaPlatoonTypes = [];
        const platoonsMeta: TScheduleMetaPlatoons = {};
        const datesMeta: TScheduleMetaDates = {};

        Object.keys(scheduleObj).forEach((platoonType) => {
            platoonTypesMeta.push(platoonType);
            platoonsMeta[platoonType] = Object.keys(scheduleObj[platoonType]);

            Object.keys(scheduleObj[platoonType]).forEach((platoon) => {
                datesMeta[platoon] = Object.keys(
                    scheduleObj[platoonType][platoon],
                );
            });
        });

        return {
            platoonTypes: platoonTypesMeta,
            platoons: platoonsMeta,
            dates: datesMeta,
        };
    }

    private _getAllDateRowsFromActiveIndeces(
        worksheet: Worksheet,
        activeIndeces: number[],
    ): number[] {
        const datesRowIndeces = [
            getRowIndecesContainingString(
                worksheet,
                this._excelTriggers.weekday,
            )[1],
        ];

        activeIndeces.reduce((prevRowIndex, currRowIndex) => {
            if (currRowIndex - prevRowIndex !== 1) {
                datesRowIndeces.push(currRowIndex - 1);
            }

            return currRowIndex;
        });

        return datesRowIndeces;
    }

    private getColumnsFromTriggers(
        worksheet: Worksheet,
    ): {
        platoonTypeColumn: number;
        platoonColumn: number;
        weekdayColumn: number;
        trainingsColumn: number;
        dateColumn: number;
    } {
        const {
            platoonType,
            platoon,
            weekday,
            // trainings,
            date,
        } = this._excelTriggers;

        return {
            platoonTypeColumn: head(
                getColumnIndecesContainingString(worksheet, platoonType),
            ),
            platoonColumn: head(
                getColumnIndecesContainingString(worksheet, platoon),
            ),
            weekdayColumn: head(
                getColumnIndecesContainingString(worksheet, weekday),
            ),
            trainingsColumn: 3,
            // trainingsColumn: head(
            //     getColumnIndecesContainingString(worksheet, trainings),
            // ),
            dateColumn: head(getColumnIndecesContainingString(worksheet, date)),
        };
    }

    async parse(path: string): Promise<TScheduleObject> {
        const schedule: TSchedule = {};
        const workbook = new Workbook();

        try {
            await workbook.xlsx.readFile(path);
        } catch (exception) {
            throw ScheduleParserError("Cannot read xlsx file");
        }

        const worksheet = workbook.getWorksheet(1);

        const {
            platoonTypeColumn,
            platoonColumn,
            weekdayColumn,
            trainingsColumn,
            dateColumn,
        } = this.getColumnsFromTriggers(worksheet);

        const activeIndeces = getAllActiveIndeces(
            worksheet,
            platoonTypeColumn,
            this._excelTriggers.platoonType,
        );

        const platoonTypes: string[] = [];
        const platoons: string[] = [];
        const weekdays: string[] = [];

        activeIndeces.forEach((rowIndex, iter) => {
            platoonTypes.push(
                getCellFromRowAndColumn(worksheet, rowIndex, platoonTypeColumn),
            );
            platoons.push(
                getCellFromRowAndColumn(worksheet, rowIndex, platoonColumn),
            );
            weekdays.push(
                getCellFromRowAndColumn(worksheet, rowIndex, weekdayColumn),
            );

            schedule[platoonTypes[iter]] = {};
        });

        const colorPalette = getTrainingsColorPalette(
            worksheet,
            trainingsColumn,
        );

        /* Get all date rows */
        const datesRowIndeces = this._getAllDateRowsFromActiveIndeces(
            worksheet,
            activeIndeces,
        );

        /* Get all date columns */
        const datesAllColumns = getAllCellsFromRow(
            worksheet,
            datesRowIndeces,
            dateColumn,
        );

        /* Get schedule for all date columns */
        activeIndeces.forEach((rowIndex, iter) => {
            /* Get current date row */
            let currDateRow: { row: number; index: number } = {
                row: 0,
                index: 0,
            };

            datesAllColumns.reduce((prevDateColumn, currDateColumn, index) => {
                if (
                    rowIndex > prevDateColumn.row &&
                    rowIndex < currDateColumn.row
                ) {
                    currDateRow = { row: prevDateColumn.row, index: index - 1 };
                } else if (rowIndex > currDateColumn.row) {
                    currDateRow = { row: currDateColumn.row, index };
                }

                return currDateColumn;
            });

            /* Make platoonTypes->platoon obj */
            schedule[platoonTypes[iter]][platoons[iter]] = {};

            /* Get full schedule */
            let scheduleForSingleDay: string[] = [];

            datesAllColumns[currDateRow.index].dates.reduce(
                (
                    prevDate,
                    currDate,
                    datesAllColumnsIndex,
                    datesAllColumnsArray,
                ) => {
                    const currentLesson = getCellFromRowAndColumn<CellValue>(
                        worksheet,
                        rowIndex,
                        prevDate.col,
                    );
                    const currentlessonColor = getColorFromRowAndColumn(
                        worksheet,
                        rowIndex,
                        prevDate.col,
                    );

                    let relativeLesson = "Самоподготовка";
                    /* Get relative lesson */
                    if (currentLesson) {
                        if ((currentLesson as CellRichTextValue).richText) {
                            relativeLesson = (currentLesson as CellRichTextValue)
                                .richText[0].text;
                        } else {
                            relativeLesson = currentLesson as string;
                        }
                    } else if (currentlessonColor) {
                        colorPalette.forEach((color) => {
                            if (color.index === currentlessonColor) {
                                relativeLesson = color.value as string;
                            }
                        });
                    }

                    scheduleForSingleDay.push(
                        capitalizeFirstLetter(relativeLesson)
                            .trim()
                            .replace(/(\r|\n|\t|\s{2,})/g, " "),
                    );

                    /* Make ...->platoon->dates obj */
                    if (currDate.value !== prevDate.value) {
                        /* Check if day is free */
                        const scheduleCheckFreeDaysArray = colorPalette.map(
                            ({ value }) => value as string,
                        );

                        scheduleCheckFreeDaysArray.push("Самоподготовка");

                        if (
                            hasOnlyValuesFromArray(
                                scheduleForSingleDay,
                                scheduleCheckFreeDaysArray,
                            )
                        ) {
                            scheduleForSingleDay = ["Занятий не будет!"];
                        }

                        schedule[platoonTypes[iter]][platoons[iter]][
                            (prevDate.value as string).trim()
                        ] = {
                            weekday: weekdays[iter],
                            schedule: scheduleForSingleDay,
                        };

                        scheduleForSingleDay = [];

                        /* Get schedule for last day */
                        if (
                            datesAllColumnsIndex ===
                            datesAllColumnsArray.length - 6
                        ) {
                            const lesson = getCellFromRowAndColumn(
                                worksheet,
                                rowIndex,
                                currDate.col,
                            );

                            if (lesson) {
                                scheduleForSingleDay.push(lesson);
                            } else {
                                scheduleForSingleDay.push("Занятий не будет!");
                            }

                            schedule[platoonTypes[iter]][platoons[iter]][
                                currDate.value as string
                            ] = {
                                weekday: weekdays[iter],
                                schedule: scheduleForSingleDay,
                            };
                        }
                    }

                    return currDate;
                },
            );
        });

        return {
            meta: this._buildMeta(schedule),
            schedule,
        };
    }
}

export default new ScheduleParser();
