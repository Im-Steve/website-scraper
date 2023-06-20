const consoleColors = require('../consoleColors');
const consoleLog = require('../consoleLog');
const extractAge = require('../extract/extractAge');
const extractColor = require('../extract/extractColor');
const extractDimensions = require('../extract/extractDimensions');
const extractMaterial = require('../extract/extractMaterial');
const extractNumberOfPieces = require('../extract/extractNumberOfPieces');
const extractPencilTip = require('../extract/extractPencilTip');
const extractPencilType = require('../extract/extractPencilType');
const extractQuantity = require('../extract/extractQuantity');
const extractSheetCount = require('../extract/extractSheetCount');
const extractTheme = require('../extract/extractTheme');
const extractWeight = require('../extract/extractWeight');

function getExtractedData(item) {
  console.log(consoleColors.step, 'Scrape data');
  // const consoleDebug = consoleLog.debug('extract');
  // consoleDebug(`item: ${JSON.stringify(item, null, 2)}`);

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

  const age = extractAge(item);
  const numberOfPieces = extractNumberOfPieces(item);
  const sheetCount = extractSheetCount(item);
  const quantity = extractQuantity(item);
  const color = extractColor(item);
  const material = extractMaterial(item);
  const theme = extractTheme(item);
  const pencilTip = extractPencilTip(item);
  const pencilType = extractPencilType(item);
  const { dimensions, length, width } = extractDimensions(item);
  const weight = extractWeight(item);

  let itemCount = sheetCount || numberOfPieces;

  const consoleDebugPiece = consoleLog.debug('pieces');
  consoleDebugPiece(`itemCount: ${itemCount}`);
  const useCountFromItem = !numberOfPieces && !sheetCount && 'itemCount' in item && item.itemCount;
  consoleDebugPiece(`use item.itemCount: ${!!useCountFromItem}`);
  if (useCountFromItem) {
    itemCount = item.itemCount;
    consoleDebugPiece(`itemCount: ${itemCount}`);
  }

  let qt1 = false;
  process.argv.forEach((argv) => {
    if (argv === 'qt1') {
      qt1 = true;
    }
  });

  if (qt1) {
    consoleDebugPiece('qt1 is on: true');
    consoleDebugPiece(`has itemCount: ${!!itemCount}`);
    if (!itemCount) {
      const includesEnsemble = (
        title.includes('ens. de')
        || title.includes('ensemble de')
        || description.includes('ens. de')
        || description.includes('ensemble de'));
      consoleDebugPiece(`includes 'ensemble': ${includesEnsemble}`);
      if (includesEnsemble) {
        itemCount = null;
        consoleDebugPiece(`itemCount: ${itemCount}`);
      } else if (!itemCount) {
        itemCount = '1 pièce';
        consoleDebugPiece(`itemCount: ${itemCount}`);
      }
    }
  }

  const newItem = {
    age,
    itemCount: itemCount || ('itemCount' in item && item.itemCount ? item.itemCount : false) || '',
    quantity,
    color,
    material,
    theme,
    pencilTip,
    pencilType,
    dimensions,
    length,
    width,
    height: 'height' in item && item.height ? item.height : '',
    weight,
  };

  // consoleLog.dev('return...');
  // consoleDebug(`newItem returned: ${JSON.stringify(newItem, null, 2)}`);
  return {
    ...item,
    ...newItem,
    fromExtract: JSON.stringify(newItem, null, 2),
  };
}

module.exports = getExtractedData;
