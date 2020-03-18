import { Workbook, Worksheet } from "exceljs";

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
import { head } from "@/helpers/general";

// TODO: rewrite like Firebase
class ScheduleParser {
    /* Triggers for Excel table columns detection */
    private _excelTriggers = {
        platoonType: "ВУС",
        platoon: "Учебный взвод",
        weekday: "День недели",
        date: "1-я неделя",
        trainings: "Тренировки:",
    };

    private _formMeta(scheduleObj) {
        const platoonTypesMeta = [];
        const platoonsMeta = {};
        const datesMeta = {};

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
        activeIndeces,
    ) {
        const datesRowIndeces = [
            getRowIndecesContainingString(
                worksheet,
                this._excelTriggers.weekday,
            )[1],
        ];

        return activeIndeces.reduce((prevRowIndex, currRowIndex) => {
            if (currRowIndex - prevRowIndex !== 1) {
                datesRowIndeces.push(currRowIndex - 1);
            }
            return currRowIndex;
        });
    }

    private getColumnsFromTriggers(worksheet: Worksheet) {
        const {
            platoonType,
            platoon,
            weekday,
            trainings,
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
            // trainingsColumn: head(getColumnIndecesContainingString(worksheet, trainings)),
            dateColumn: head(getColumnIndecesContainingString(worksheet, date)),
        };
    }

    async parse(path: string) {
        const schedule = {};
        const workbook = new Workbook();

        try {
            await workbook.xlsx.readFile(path);
        } catch (exception) {
            throw exception;
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

        const platoonTypes = [];
        const platoons = [];
        const weekdays = [];

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
            // TODO: remove all @ts-ignores
            let currDateRow: { row: string; index: number } = {
                row: "",
                index: 0,
            };

            datesAllColumns.reduce((prevDateColumn, currDateColumn, index) => {
                if (
                    rowIndex > prevDateColumn.row &&
                    rowIndex < currDateColumn.row
                ) {
                    currDateRow = { row: prevDateColumn.row, index: index - 1 };
                    return currDateColumn;
                } else if (rowIndex > currDateColumn.row) {
                    currDateRow = { row: currDateColumn.row, index };
                    return currDateColumn;
                }
                return null;
            });

            /* Make platoonTypes->platoon obj */
            schedule[platoonTypes[iter]][platoons[iter]] = {};

            /* Get full schedule */
            let scheduleForSingleDay = [];

            datesAllColumns[currDateRow.index].dates.reduce(
                (
                    prevDate,
                    currDate,
                    datesAllColumnsIterator,
                    datesAllColumnsArray,
                ) => {
                    const currentLesson = getCellFromRowAndColumn(
                        worksheet,
                        rowIndex,
                        prevDate.col,
                    );
                    const currentlessonColor = getColorFromRowAndColumn(
                        worksheet,
                        rowIndex,
                        prevDate.col,
                    );

                    /* Get relative lesson */
                    if (currentLesson) {
                        if (currentLesson.richText) {
                            scheduleForSingleDay.push(
                                currentLesson.richText[0].text.replace(
                                    /\r\n/g,
                                    " ",
                                ),
                            );
                        } else {
                            scheduleForSingleDay.push(
                                currentLesson.replace(/\r\n/g, " "),
                            );
                        }
                    } else if (currentlessonColor) {
                        colorPalette.forEach((color) => {
                            if (color.index === currentlessonColor) {
                                scheduleForSingleDay.push(color.value);
                            }
                        });
                    } else {
                        scheduleForSingleDay.push("Самоподготовка");
                    }

                    /* Make ...->platoon->dates obj */
                    if (currDate.value !== prevDate.value) {
                        /* Check if day is free */
                        const scheduleCheckFreeDaysArray = colorPalette.map(
                            ({ value }) => value,
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
                            prevDate.value.trim()
                        ] = {
                            weekday: weekdays[iter],
                            schedule: scheduleForSingleDay,
                        };

                        scheduleForSingleDay = [];

                        /* Get schedule for last day */
                        if (
                            datesAllColumnsIterator ===
                            datesAllColumnsArray.length - 1
                        ) {
                            const lesson = getCellFromRowAndColumn(
                                worksheet,
                                rowIndex,
                                currDate.col,
                            );

                            if (lesson) {
                                scheduleForSingleDay.push(
                                    lesson.replace(/\r\n/g, " "),
                                );
                            } else
                                scheduleForSingleDay.push("Занятий не будет!");

                            schedule[platoonTypes[iter]][platoons[iter]][
                                currDate.value
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
            meta: this._formMeta(schedule),
            schedule,
        };
    }
}

export default new ScheduleParser();
