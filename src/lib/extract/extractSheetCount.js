const consoleLog = require('../consoleLog');
const { formatInteger } = require('../format/formatMeasures');

function extractSheetCount(item) {
  const consoleDebug = consoleLog.debug('pieces');
  let extractedNumber = null;
  let sheetCount = null;
  const title = 'title' in item && typeof item.title === 'string'
    ? item.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') : '';
  const description = 'description' in item && typeof item.description === 'string'
    ? item.description
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') : '';

  consoleLog.dev('extract sheet count...');
  consoleDebug(`title: ${title}`);
  consoleDebug(`description: ${description}`);

  // Search number before text
  if (!sheetCount) {
    extractedNumber = title.match(/(\d+)(?=\s*feuille)/i)
    || title.match(/(\d+)(?=\s*f\s)/i)
    || title.match(/(\d+)(?=\s*f\.)/i)
    || title.match(/(\d+)(?=\s*sheet)/i)
    || title.match(/(\d+)(?=\s*papier)/i)
    || description.match(/(\d+)(?=\s*feuille)/i)
    || description.match(/(\d+)(?=\s*f\s)/i)
    || description.match(/(\d+)(?=\s*f\.)/i)
    || description.match(/(\d+)(?=\s*sheet)/i)
    || description.match(/(\d+)(?=\s*papier)/i);

    extractedNumber = formatInteger(extractedNumber);
    if (extractedNumber && extractedNumber > 1) {
      sheetCount = `${extractedNumber} feuilles`;
    } else if (extractedNumber && extractedNumber === 1) {
      sheetCount = `${extractedNumber} feuille`;
    }

    extractedNumber = title.match(/(\d+)(?=\s*page)/i)
    || description.match(/(\d+)(?=\s*page)/i);

    extractedNumber = formatInteger(extractedNumber);
    if (extractedNumber && extractedNumber > 1) {
      sheetCount = `${extractedNumber} pages`;
    } else if (extractedNumber && extractedNumber === 1) {
      sheetCount = `${extractedNumber} page`;
    }

    consoleDebug(`sheetCount before text: ${sheetCount}`);
  }

  // Removed because we are now using itemCount
  // const useItemSheetCount = !sheetCount && 'sheetCount' in item && item.sheetCount;
  // consoleDebug(`use item.sheetCount: ${!!useItemSheetCount}`);
  // if (useItemSheetCount) {
  //   sheetCount = item.sheetCount;
  //   consoleDebug(`sheetCount: ${sheetCount}`);
  // }

  consoleDebug(`return formatted sheetCount: ${sheetCount}`);
  return sheetCount;
}

module.exports = extractSheetCount;
