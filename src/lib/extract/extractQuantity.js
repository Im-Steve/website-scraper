const consoleLog = require('../consoleLog');
const { formatOneMeasure } = require('../format/formatMeasures');
const quantityList = require('../lists/quantityList');

function extractQuantity(item) {
  const consoleDebug = consoleLog.debug('quantity');
  let extractedQuantity = null;
  let unit = '';
  let quantity = null;
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

  consoleLog.dev('extract quantity...');
  consoleDebug(`title: ${title}`);
  consoleDebug(`description: ${description}`);

  quantityList.forEach((unitOfMeasure) => {
    const normalizedUnit = unitOfMeasure.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if (!extractedQuantity) {
      consoleDebug(`check ${unitOfMeasure}...`);

      const regex = /(\d+[.,]?\d*)(?=\s*unit)/;
      const regexWithUnit = new RegExp(regex.source.replace('unit', normalizedUnit), 'i');

      extractedQuantity = title.match(regexWithUnit) || description.match(regexWithUnit);

      if (extractedQuantity) {
        if (unitOfMeasure === 'litre' || unitOfMeasure === 'liter') {
          consoleDebug(`many litres? ${extractedQuantity[0] > 1}`);
          unit = extractedQuantity[0] > 1 ? 'litres' : 'litre';
        } else {
          unit = unitOfMeasure;
        }
      }
      consoleDebug(`extractedQuantity: ${extractedQuantity}`);
      consoleDebug(`unit: ${unit}`);
    }
  });

  consoleDebug(`use extractedQuantity: ${extractedQuantity}`);
  if (extractedQuantity) {
    quantity = `${extractedQuantity[0]} ${unit}`;
    consoleDebug(`quantity: ${quantity}`);
  }

  const useItemQuantity = !extractedQuantity && 'quantity' in item && item.quantity;
  consoleDebug(`use item.quantity: ${!!useItemQuantity}`);
  if (useItemQuantity) {
    quantity = item.quantity;
    consoleDebug(`quantity: ${quantity}`);
  }

  quantity = formatOneMeasure(quantity);
  consoleDebug(`return formatted quantity: ${quantity}`);
  return quantity;
}

module.exports = extractQuantity;
