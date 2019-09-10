const Excel = require('exceljs');

// get rid of Promise and replace it by async/await
function getScheduleForPlatoon(platoon, date) {
  return new Promise((resolve, reject) => {
    const workbook = new Excel.Workbook();
    const schedule = [];

    const timeArr = [
      '9:15-10:45',
      '11:00-12:30',
      '12:45-14:15',
      '15:00-15:45',
      '15:55-16:40',
      '16:50-17:35',
    ];

    workbook.xlsx.readFile('./static/schedule.xlsx')
      .then(() => {
        const worksheet = workbook.getWorksheet(1);

        const platoonRow = getRowIndexContainingString(worksheet, platoon);

        const weekdayColumn = getColumnIndexesContainingString(worksheet, 'День недели')[0];
        const forcesColumn = getColumnIndexesContainingString(worksheet, 'ВУС')[0];
        // const trainingsColumn = getColumnIndexesContainingString(worksheet, 'Тренировки:')[0];
        const trainingsColumn = 3;
        const weekColumn = getColumnIndexesContainingString(worksheet, date);

        const weekday = worksheet.getRow(platoonRow).getCell(weekdayColumn);
        const forces = worksheet.getRow(platoonRow).getCell(forcesColumn);

        const colorPalette = getTrainingsColorPalette(worksheet, trainingsColumn);

        const week = [];
        weekColumn.forEach((item) => {
          if (worksheet.getRow(platoonRow).getCell(item).fill && worksheet.getRow(platoonRow).getCell(item).fill.fgColor.indexed) {
            week.push({
              value: detectColorSimilarity(worksheet, colorPalette, platoonRow, item),
            });
            return;
          }
          week.push(worksheet.getRow(platoonRow).getCell(item));
        });

        schedule.push({
          meta: `${platoon} (${forces})` + `, ${date} (${weekday})` + ':',
        });

        for (let i = 0; i < week.length; i++) {
          schedule.push({
            time: timeArr[i],
            lesson: week[i].value || 'Самоподготовка',
          });
        }

        resolve(schedule);
      });
  });
}

module.exports = getScheduleForPlatoon;

// Helpers

// TODO: rewrite with the use of built-in function "go through all non-null values"
// TODO: add division for 2 abilities: first colIndex, all colIndexes
function getRowIndexContainingString(worksheet, str) {
  let tmpValue = null;
  let targetRowNumber = null;

  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell, colNumber) => {
      if (tmpValue && tmpValue !== cell.value) {
        if (cell.value == str) {
          targetRowNumber = rowNumber;
        }
      }
      tmpValue = cell.value;
    });
  });

  return targetRowNumber;
}

function getColumnIndexesContainingString(worksheet, str) {
  let tmpValue = null;
  const targetColumnNumber = [];

  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell, colNumber) => {
      if (tmpValue) {
        if (cell.value == str) {
          targetColumnNumber.push(colNumber);
        }
      }
      tmpValue = cell.value;
    });
  });

  return popSimilarValues(targetColumnNumber);
}

function getTrainingsColorPalette(worksheet, column) {
  const colorPalette = [];

  worksheet.getColumn(column).eachCell((cell, rowNumber) => {
    if (cell.fill && cell.fill.fgColor.indexed) {
      colorPalette.push({
        index: cell.fill.fgColor.indexed,
        value: worksheet.getRow(rowNumber).getCell(column + 2).value,
      });
    }
  });

  return colorPalette;
}

function detectColorSimilarity(worksheet, colorPalette, row, index) {
  let targetValue = null;

  colorPalette.forEach((color) => {
    if (worksheet.getRow(row).getCell(index).fill.fgColor.indexed == color.index) {
      targetValue = color.value;
    }
  });

  return targetValue;
}

function popSimilarValues(array) {
  const seen = {};
  const out = [];
  const len = array.length;
  let j = 0;
  for (let i = 0; i < len; i++) {
    const item = array[i];
    if (seen[item] !== 1) {
      seen[item] = 1;
      out[j++] = item;
    }
  }
  return out;
}
