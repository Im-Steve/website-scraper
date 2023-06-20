const xlsx = require('xlsx');

const consoleColors = require('../consoleColors');

function exportExcelFile(data, ExcelFilePath) {
  console.log(consoleColors.step, 'Export in the Excel file');

  try {
    const workbook = xlsx.utils.book_new();
    const sheet = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(workbook, sheet, 'Sheet1');
    xlsx.writeFile(workbook, ExcelFilePath);
  } catch (error) {
    console.log(consoleColors.error, 'Error while exporting the Excel file');
    console.log(error);
    console.log(consoleColors.error, 'process.exit();');
    process.exit();
  }
}

module.exports = exportExcelFile;
