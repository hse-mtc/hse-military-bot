import makeError from "make-error";
import { Workbook, Worksheet, CellValue, CellRichTextValue } from "exceljs";

import {
    getAllActiveIndexes,
    getAllCellsFromRow,
    getCellFromRowAndColumn,
    getColorFromRowAndColumn,
    getColumnIndexesContainingString,
    getRowIndexesContainingString,
    getTrainingsColorPalette,
    hasOnlyValuesFromArray,
} from "@/helpers/schedule";
import { head, capitalizeFirstLetter } from "@/helpers/general";

import {
    TSchedule,
    TScheduleMeta,
    TScheduleObject,
    TScheduleMetaPlatoonTypes,
    TScheduleMetaPlatoons,
    TScheduleMetaDates,
} from ".";

const ScheduleParserError = makeError("ScheduleParserError");

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

    private _getAllDateRowsFromActiveIndexes(
        worksheet: Worksheet,
        activeIndexes: number[],
    ): number[] {
        const datesRowIndexes = [
            getRowIndexesContainingString(
                worksheet,
                this._excelTriggers.weekday,
            )[1],
        ];

        activeIndexes.reduce((prevRowIndex, currRowIndex) => {
            if (currRowIndex - prevRowIndex !== 1) {
                datesRowIndexes.push(currRowIndex - 1);
            }

            return currRowIndex;
        });

        return datesRowIndexes;
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
                getColumnIndexesContainingString(worksheet, platoonType),
            ),
            platoonColumn: head(
                getColumnIndexesContainingString(worksheet, platoon),
            ),
            weekdayColumn: head(
                getColumnIndexesContainingString(worksheet, weekday),
            ),
            trainingsColumn: 3,
            // trainingsColumn: head(
            //     getColumnIndexesContainingString(worksheet, trainings),
            // ),
            dateColumn: head(getColumnIndexesContainingString(worksheet, date)),
        };
    }

    async parse(path: string): Promise<TScheduleObject> {
        const schedule: TSchedule = {};
        const workbook = new Workbook();

        try {
            await workbook.xlsx.readFile(path);
        } catch (exception) {
            throw new ScheduleParserError("Cannot read xlsx file");
        }

        const worksheet = workbook.getWorksheet(1);

        const {
            platoonTypeColumn,
            platoonColumn,
            weekdayColumn,
            trainingsColumn,
            dateColumn,
        } = this.getColumnsFromTriggers(worksheet);

        const activeIndexes = getAllActiveIndexes(
            worksheet,
            platoonTypeColumn,
            this._excelTriggers.platoonType,
        );

        const platoonTypes: string[] = [];
        const platoons: string[] = [];
        const weekdays: string[] = [];

        activeIndexes.forEach((rowIndex, iter) => {
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
        const datesRowIndexes = this._getAllDateRowsFromActiveIndexes(
            worksheet,
            activeIndexes,
        );

        /* Get all date columns */
        const datesAllColumns = getAllCellsFromRow(
            worksheet,
            datesRowIndexes,
            dateColumn,
        );

        /* Get schedule for all date columns */
        activeIndexes.forEach((rowIndex, iter) => {
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
                    const currentLessonColor = getColorFromRowAndColumn(
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
                    } else if (currentLessonColor) {
                        colorPalette.forEach((color) => {
                            if (color.index === currentLessonColor) {
                                relativeLesson = color.value as string;
                            }
                        });
                    }

                    scheduleForSingleDay.push(
                        capitalizeFirstLetter(relativeLesson)
                            .trim()
                            .replace(/(\r|\n|\t)/g, " ")
                            .replace(/\s{2,}/g, " "),
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
