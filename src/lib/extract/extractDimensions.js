const consoleLog = require('../consoleLog');
const { formatDimensions, formatOneMeasure } = require('../format/formatMeasures');
const quantityList = require('../lists/quantityList');
const sheetSizeList = require('../lists/sheetSizeList');
const unitOfMeasureList = require('../lists/unitOfMeasureList');

const consoleDebug = consoleLog.debug('dimensions');

// Search dimensions with unit
function searchWithUnit(text) {
  let regexString = '';
  let regex;
  let matches = null;
  let unit = null;

  unitOfMeasureList.forEach((unitOfMeasure) => {
    const normalizedUnit = unitOfMeasure.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if (!matches) {
      regexString = `([\\d.,½]+)\\s*${normalizedUnit}\\s*x\\s*([\\d.,½]+)`;
      regex = new RegExp(regexString);
      matches = text.match(regex);
    }
    if (!matches) {
      regexString = `([\\d.,½]+)\\s*x\\s*([\\d.,½]+)\\s*${normalizedUnit}`;
      regex = new RegExp(regexString);
      matches = text.match(regex);
    }
    if (matches && !unit) {
      unit = unitOfMeasure;
    }
  });
  consoleDebug(`matches with unit: ${matches}`);
  consoleDebug(`unit: ${unit}`);

  if (matches) {
    const firstNumber = matches[1];
    const secondNumber = matches[2];

    const dimensions = `${firstNumber}x${secondNumber} ${unit}`;
    consoleDebug(`dimensions with unit: ${dimensions}`);
    consoleDebug(`length with unit: ${firstNumber} ${unit}`);
    consoleDebug(`width with unit: ${secondNumber} ${unit}`);
    return {
      dimensions,
      length: `${firstNumber} ${unit}`,
      width: `${secondNumber} ${unit}`,
    };
  }
  return null;
}

// Search dimensions without unit
function searchWithoutUnit(text) {
  let regex = /([\d.,½]+)\s*x\s*([\d.,½]+)/i;
  let matches = text.match(regex);
  consoleDebug(`matches without unit: ${matches}`);

  if (matches) {
    quantityList.forEach((quantityUnit) => {
      const regexString = `([\\d.,½]+)\\s*x\\s*([\\d.,½]+)\\s*${quantityUnit}`;
      regex = new RegExp(regexString);
      const matchesWithQuantity = text.match(regex);

      if (matchesWithQuantity) {
        matches = null;
        consoleDebug(`quantity unit found: ${quantityUnit}`);
        consoleDebug(`matches without unit: ${matches}`);
      }
    });
  }

  if (matches) {
    const firstNumber = matches[1];
    const secondNumber = matches[2];

    const dimensions = `${firstNumber}x${secondNumber}`;
    consoleDebug(`dimensions without unit: ${dimensions}`);
    consoleDebug(`length without unit: ${firstNumber}"`);
    consoleDebug(`width without unit: ${secondNumber}"`);
    return {
      dimensions,
      length: `${firstNumber}"`,
      width: `${secondNumber}"`,
    };
  }
  return null;
}

function extractDimensions(item) {
  let extractedDimensions = null;
  let dimensions = null;
  let length = null;
  let width = null;
  let useSheetSize = false;
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

  consoleLog.dev('extract dimensions...');
  consoleDebug(`title: ${title}`);
  consoleDebug(`description: ${description}`);

  if (!extractedDimensions) {
    consoleDebug('search in the title...');
    extractedDimensions = searchWithUnit(title) || searchWithoutUnit(title);
  }

  if (!extractedDimensions) {
    consoleDebug('search in the description...');
    extractedDimensions = searchWithUnit(description) || searchWithoutUnit(description);
  }

  if (extractedDimensions) {
    dimensions = extractedDimensions.dimensions;
    length = extractedDimensions.length;
    width = extractedDimensions.width;
  }

  const useItemDimensions = 'length' in item && item.length
    && 'width' in item && item.width;
  consoleDebug(`use item dimensions: ${!!useItemDimensions}`);
  if (useItemDimensions) {
    length = item.length;
    width = item.width;
    consoleDebug(`dimensions: ${length}, ${width}`);
  }

  // Search a sheet size
  consoleDebug(`search a sheet size: ${!extractedDimensions}`);
  if (!extractedDimensions) {
    sheetSizeList.forEach((sheetSize) => {
      if (title.includes(sheetSize) || description.includes(sheetSize)) {
        dimensions = sheetSize.toUpperCase();
        useSheetSize = true;
      }
    });
    consoleDebug(`dimensions from sheetSizeList: ${dimensions}`);
  }

  if (dimensions && !useSheetSize) {
    dimensions = formatDimensions(dimensions);
    length = formatOneMeasure(length);
    width = formatOneMeasure(width);
  }

  consoleDebug(`return formatted dimension: ${JSON.stringify({ dimensions, length, width }, null, 2)}`);
  return { dimensions, length, width };
}

module.exports = extractDimensions;
