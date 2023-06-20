const xlsx = require('xlsx');

const consoleColors = require('../consoleColors');

function importExcelFile(ExcelFilePath) {
  console.log('--------------------');
  console.log(consoleColors.step, 'Import the Excel file');
  console.log('import in progress...');
  let data = [];

  try {
    const workbook = xlsx.readFile(ExcelFilePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    data = xlsx.utils.sheet_to_json(worksheet);
    console.log(consoleColors.success, 'Excel file imported');
  } catch (error) {
    console.log(consoleColors.error, 'Error while importing the Excel file');
    console.log(error);
    console.log(consoleColors.error, 'process.exit();');
    process.exit();
  }

  if (data.length === 0) {
    console.log(consoleColors.error, 'Empty Excel file');
    console.log(consoleColors.error, 'process.exit();');
    process.exit();
  }

  console.log('--------------------');
  return data;
}

module.exports = importExcelFile;
