const Excel = require('exceljs');

//get rid of Promise and replace it by async/await
function getScheduleForPlatoon(platoon, date) {
	return new Promise((resolve, reject) => {
		const workbook = new Excel.Workbook();
		let schedule = [];

		const timeArr = [
		"9:15-10:45",
		"11:00-12:30",
		"12:45-14:15",
		"15:00-15:45",
		"15:55-16:40",
		"16:50-17:35"
		];

		workbook.xlsx.readFile("static/schedule.xlsx")
		.then(() => {
			let worksheet = workbook.getWorksheet(1);

			let platoonRow = getRowIndexContainingString(worksheet, platoon);

			let weekdayColumn = getColumnIndexesContainingString(worksheet, "День недели")[0];
			let forcesColumn = getColumnIndexesContainingString(worksheet, "ВУС")[0];
			let trainingsColumn = getColumnIndexesContainingString(worksheet, "Тренировки:")[0];
			let weekColumn = getColumnIndexesContainingString(worksheet, date);

			let weekday = worksheet.getRow(platoonRow).getCell(weekdayColumn);
			let forces = worksheet.getRow(platoonRow).getCell(forcesColumn);

			let colorPalette = getTrainingsColorPalette(worksheet, trainingsColumn);

			let week = [];
			weekColumn.forEach(item => {
				if (worksheet.getRow(platoonRow).getCell(item).fill && worksheet.getRow(platoonRow).getCell(item).fill.fgColor.indexed) {				
					week.push({
						value: detectColorSimilarity(worksheet, colorPalette, platoonRow, item)
					});
					return;
				};
				week.push(worksheet.getRow(platoonRow).getCell(item));
			});

			schedule.push({
				"meta": platoon + ' (' +  forces + ')' + ', ' + date + ' (' + weekday + ')' + ':'
			});

			for (let i = 0; i < week.length; i++) {
				schedule.push({
					"time": timeArr[i],
					"lesson": week[i].value || "Самоподготовка"
				});
			};

			resolve(schedule);
		});
	});
};

module.exports = getScheduleForPlatoon;

// Helpers

//TODO: rewrite with the use of built-in function "go through all non-null values"
//TODO: add division for 2 abilities: first colIndex, all colIndexes
function getRowIndexContainingString(worksheet, str) {
	let tmpValue = null;
	let targetRowNumber = null;

	worksheet.eachRow((row, rowNumber) => {
		row.eachCell((cell, colNumber) => {
			if (tmpValue && tmpValue !== cell.value) {
				if (cell.value == str) {
					targetRowNumber = rowNumber;
				}
			};
			tmpValue = cell.value;
		});
	});

	return targetRowNumber;
};

function getColumnIndexesContainingString(worksheet, str) {
	let tmpValue = null;
	let targetColumnNumber = [];

	worksheet.eachRow((row, rowNumber) => {
		row.eachCell((cell, colNumber) => {
			if (tmpValue) {
				if (cell.value == str) {
					targetColumnNumber.push(colNumber);
				}
			};
			tmpValue = cell.value;
		});
	});

	return popSimilarValues(targetColumnNumber);
};

function getTrainingsColorPalette(worksheet, column) {
	let colorPalette = [];
	
	worksheet.getColumn(column).eachCell((cell, rowNumber) => {
		if (cell.fill && cell.fill.fgColor.indexed) {
			colorPalette.push({
				index: cell.fill.fgColor.indexed,
				value: worksheet.getRow(rowNumber).getCell(column + 2).value
			});
		};
	});

	return colorPalette;
};

function detectColorSimilarity(worksheet, colorPalette, row, index) {
	let targetValue = null;

	colorPalette.forEach(color => {
		if (worksheet.getRow(row).getCell(index).fill.fgColor.indexed == color.index) {
			targetValue = color.value;
		};
	});

	return targetValue;
};

function popSimilarValues(array) {
	let seen = {};
	let out = [];
	let len = array.length;
	let j = 0;
	for(let i = 0; i < len; i++) {
		let item = array[i];
		if(seen[item] !== 1) {
			seen[item] = 1;
			out[j++] = item;
		}
	}
	return out;
};
