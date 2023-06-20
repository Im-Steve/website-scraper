const consoleLog = require('../consoleLog');
const { formatOneMeasure } = require('../format/formatMeasures');
const weightList = require('../lists/weightList');

function extractWeight(item) {
  const consoleDebug = consoleLog.debug('weight');
  let extractedWeight = null;
  let unit = '';
  let weight = null;
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

  consoleLog.dev('extract weight...');
  consoleDebug(`title: ${title}`);
  consoleDebug(`description: ${description}`);

  weightList.forEach((unitOfMeasure) => {
    const normalizedUnit = unitOfMeasure.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if (!extractedWeight) {
      consoleDebug(`check ${unitOfMeasure}...`);

      const regex = /(\d+[.,]?\d*)(?=\s*unit)/;
      const regexWithUnit = new RegExp(regex.source.replace('unit', normalizedUnit), 'i');

      extractedWeight = title.match(regexWithUnit) || description.match(regexWithUnit);

      if (extractedWeight) {
        if (unitOfMeasure === 'lb'
        || unitOfMeasure.includes('livre')
        || unitOfMeasure.includes('pound')
        ) {
          consoleDebug(`many lbs? ${extractedWeight[0] > 1}`);
          unit = extractedWeight[0] > 1 ? 'lbs' : 'lb';
        } else {
          unit = unitOfMeasure;
        }
      }
      consoleDebug(`extractedWeight: ${extractedWeight}`);
      consoleDebug(`unit: ${unit}`);
    }
  });

  consoleDebug(`use extractedWeight: ${extractedWeight}`);
  if (extractedWeight) {
    weight = `${extractedWeight[0]} ${unit}`;
    consoleDebug(`weight: ${weight}`);
  }

  const useItemWeight = !extractedWeight && 'weight' in item && item.weight;
  consoleDebug(`use item.weight: ${!!useItemWeight}`);
  if (useItemWeight) {
    weight = item.weight;
    consoleDebug(`weight: ${weight}`);
  }

  weight = formatOneMeasure(weight);
  consoleDebug(`return formatted weight: ${weight}`);
  return weight;
}

module.exports = extractWeight;
