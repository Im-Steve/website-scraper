const consoleLog = require('../consoleLog');
const { formatPencilTip } = require('../format/formatMeasures');
const pencilTipList = require('../lists/pencilTipList');

function extractPencilTip(item) {
  const consoleDebug = consoleLog.debug('pencil');
  let extractedTip = null;
  let pencilTip = null;
  const title = 'title' in item && typeof item.title === 'string'
    ? item.title.toLowerCase() : '';
  const description = 'description' in item && typeof item.description === 'string'
    ? item.description.toLowerCase() : '';

  consoleLog.dev('extract pencil tip...');
  consoleDebug(`title: ${title}`);
  consoleDebug(`description: ${description}`);

  const regex = /([.,]?\d+[.,]?\d*)(?=\s*mm)/;
  extractedTip = title.match(regex) || description.match(regex);
  consoleDebug(`extractedTip from regex: ${extractedTip}`);

  if (!extractedTip) {
    pencilTipList.forEach((tip) => {
      if (title.includes(tip) || description.includes(tip)) {
        extractedTip = [tip];
      }
    });
    consoleDebug(`extractedTip from list: ${extractedTip}`);
  }

  consoleDebug(`use extractedTip: ${!!extractedTip}`);
  if (extractedTip) {
    pencilTip = extractedTip[0].charAt(0) === '.' ? `0${extractedTip[0]} mm` : `${extractedTip[0]} mm`;
    consoleDebug(`pencilTip: ${pencilTip}`);
  }

  const useItemPencilTip = !extractedTip && 'pencilTip' in item && item.pencilTip;
  consoleDebug(`use item.pencilTip: ${!!useItemPencilTip}`);
  if (useItemPencilTip) {
    pencilTip = item.pencilTip;
    consoleDebug(`pencilTip: ${pencilTip}`);
  }

  pencilTip = formatPencilTip(pencilTip);
  consoleDebug(`return formatted pencilTip: ${pencilTip}`);
  return pencilTip;
}

module.exports = extractPencilTip;
