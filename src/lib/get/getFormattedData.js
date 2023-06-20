const consoleColors = require('../consoleColors');
const consoleLog = require('../consoleLog');
const { formatAge, formatGeneralData } = require('../format/formatGeneralData');
const {
  formatDimensions,
  formatOneMeasure,
  formatPencilTip,
} = require('../format/formatMeasures');

function getFormattedData(item) {
  console.log(consoleColors.step, 'Format data');
  const consoleDebug = consoleLog.debug('format');
  // consoleDebug(`item: ${JSON.stringify(item, null, 2)}`);

  let newItem;

  item.age = formatAge(item.age);
  consoleDebug(`age formatted: ${item.age}`);

  item.quantity = formatOneMeasure(item.quantity);
  consoleDebug(`quantity formatted: ${item.quantity}`);

  item.color = formatGeneralData(item.color);
  consoleDebug(`color formatted: ${item.color}`);

  item.material = formatGeneralData(item.material);
  consoleDebug(`material formatted: ${item.material}`);

  item.pencilTip = formatPencilTip(item.pencilTip);
  consoleDebug(`pencilTip formatted: ${item.pencilTip}`);

  item.pencilType = formatGeneralData(item.pencilType);
  consoleDebug(`pencilType formatted: ${item.pencilType}`);

  consoleDebug('--------------------');

  item.dimensions = formatDimensions(item.dimensions);
  consoleDebug(`dimensions formatted: ${item.dimensions}`);

  item.length = formatOneMeasure(item.length);
  consoleDebug(`length formatted: ${item.length}`);
  item.width = formatOneMeasure(item.width);
  consoleDebug(`width formatted: ${item.width}`);
  item.height = formatOneMeasure(item.height);
  consoleDebug(`height formatted: ${item.height}`);

  item.weight = formatOneMeasure(item.weight);
  consoleDebug(`weight formatted: ${item.weight}`);

  let checkOnBP = false;
  process.argv.forEach((argv) => {
    if (argv === 'isOnBP') {
      checkOnBP = true;
    }
  });
  if (checkOnBP) {
    newItem = {
      notOnBP: 'notOnBP' in item && item.notOnBP ? item.notOnBP : '',
      ...newItem,
    };
  }

  newItem = {
    ...newItem,
    internalCode: 'internalCode' in item && item.internalCode ? item.internalCode : '',
    title: 'title' in item && item.title ? item.title : '',
    description: 'description' in item && item.description ? item.description : '',
    imageLink: 'imageLink' in item && item.imageLink ? item.imageLink : '',
    hasImage: 'hasImage' in item && item.hasImage ? item.hasImage : '',
    codeUPC: 'codeUPC' in item && item.codeUPC ? item.codeUPC.toString() : '',
    amazonLink: 'amazonLink' in item && item.amazonLink ? item.amazonLink : '',
    notOnAmazon: 'notOnAmazon' in item && item.notOnAmazon ? item.notOnAmazon : '',
    googleLink: 'googleLink' in item && item.googleLink ? item.googleLink : '',
    supplier: 'supplier' in item && item.supplier ? item.supplier : '',
    age: item.age,
    itemCount: 'itemCount' in item && item.itemCount ? item.itemCount : '',
    quantity: item.quantity,
    color: item.color,
    material: item.material,
    theme: 'theme' in item && item.theme ? item.theme : '',
    pencilTip: item.pencilTip,
    pencilType: item.pencilType,
    dimensions: item.dimensions,
    length: item.length,
    width: item.width,
    height: item.height,
    weight: item.weight,
    fromKidToy: 'fromKidToy' in item && item.fromKidToy ? item.fromKidToy : '',
    fromAmazon: 'fromAmazon' in item && item.fromAmazon ? item.fromAmazon : '',
    fromImaginaire: 'fromImaginaire' in item && item.fromImaginaire ? item.fromImaginaire : '',
    fromBarcodeLookup: 'fromBarcodeLookup' in item && item.fromBarcodeLookup ? item.fromBarcodeLookup : '',
    fromExtract: 'fromExtract' in item && item.fromExtract ? item.fromExtract : '',
    ...item,
  };

  // consoleLog.dev('return...');
  // consoleDebug(`item returned: ${JSON.stringify(newItem, null, 2)}`);
  return newItem;
}

module.exports = getFormattedData;
