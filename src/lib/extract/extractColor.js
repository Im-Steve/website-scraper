const colorList = require('../lists/colorList');
const consoleLog = require('../consoleLog');
const { formatGeneralData } = require('../format/formatGeneralData');

function extractColor(item) {
  const consoleDebug = consoleLog.debug('color');
  let allColors = '';
  const title = 'title' in item && typeof item.title === 'string'
    ? item.title
      .toLowerCase()
      .replace(/,|-|\./g, ' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') : '';
  const description = 'description' in item && typeof item.description === 'string'
    ? item.description
      .toLowerCase()
      .replace(/,|-|\./g, ' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') : '';

  consoleLog.dev('extract color...');
  consoleDebug(`title: ${title}`);
  consoleDebug(`description: ${description}`);

  let continueWithTheColor;
  colorList.forEach((color) => {
    continueWithTheColor = true;
    const normalizedColor = color.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if (title.includes(` ${normalizedColor}`) || description.includes(` ${normalizedColor}`)) {
      const includesBrilleNoir = color === 'noir' && (title.includes('brille dans le noir') || description.includes('brille dans le noir'));
      if (continueWithTheColor && includesBrilleNoir) {
        consoleDebug(`includes 'brille dans le noir': ${includesBrilleNoir}`);
        consoleDebug(`not add: ${color}`);
        continueWithTheColor = false;
      }

      const isOr = color === 'or ';
      if (continueWithTheColor && isOr) {
        consoleDebug(`is 'or': ${isOr}`);
        consoleDebug(`'or' is not included: ${!allColors.includes('or')}`);
        if (!allColors.includes('or')) {
          allColors = allColors === '' ? 'or' : `${allColors}, or`;
          consoleDebug('new color: or');
        }
        continueWithTheColor = false;
      }

      if (continueWithTheColor && !allColors.includes(color)) {
        allColors = allColors === '' ? color : `${allColors}, ${color}`;
        consoleDebug(`new color: ${color}`);
        continueWithTheColor = false;
      }
    }
  });
  consoleDebug(`allColors: ${allColors}`);

  const addMetallique = allColors.length > 1 && !allColors.includes(',') && (title.includes('metal') || description.includes('metal'));
  consoleDebug(`add 'métallique': ${addMetallique}`);
  if (addMetallique) {
    allColors = `${allColors} métallique`;
    consoleDebug(`allColors: ${allColors}`);
  }

  const useItemColor = allColors === '' && 'color' in item && item.color;
  consoleDebug(`use item.color: ${!!useItemColor}`);
  if (useItemColor) {
    allColors = item.color;
    consoleDebug(`allColors: ${allColors}`);
  }

  allColors = formatGeneralData(allColors);
  consoleDebug(`return formatted allColors: ${allColors}`);
  return allColors;
}

module.exports = extractColor;
