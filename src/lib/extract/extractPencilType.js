const pencilTypeList = require('../lists/pencilTypeList');
const consoleLog = require('../consoleLog');
const { formatGeneralData } = require('../format/formatGeneralData');

function extractPencilType(item) {
  const consoleDebug = consoleLog.debug('pencil');
  let itemPencilType = null;
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

  consoleLog.dev('extract pencil type...');
  consoleDebug(`title: ${title}`);
  consoleDebug(`description: ${description}`);

  pencilTypeList.forEach((pencilType) => {
    const normalizedPencilType = pencilType.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if (title.includes(normalizedPencilType) || description.includes(normalizedPencilType)) {
      consoleDebug(`pencil type found: ${pencilType}`);
      itemPencilType = pencilType;

      if (pencilType === 'crayon de bois'
      || pencilType === 'crayons de bois'
      || pencilType === 'crayon bois'
      || pencilType === 'crayons bois'
      || pencilType === 'crayon de couleur'
      || pencilType === 'crayons de couleur'
      || pencilType === 'crayon coul'
      || pencilType === 'crayons coul'
      || pencilType === 'crayon à colorier'
      || pencilType === 'crayons à colorier'
      || pencilType === 'prisma'
      ) {
        itemPencilType = 'crayon de couleur';
        consoleDebug(`'crayon de couleur' found: ${itemPencilType}`);
      }

      if (pencilType === 'p-mine'
      || pencilType === 'p.-mine'
      || pencilType === 'porte-mine'
      || pencilType === 'portemine'
      ) {
        itemPencilType = 'portemine';
        consoleDebug(`'portemine' found: ${itemPencilType}`);
      }

      if (pencilType === 'crayon de croquis'
      || pencilType === 'crayons de croquis'
      || pencilType === 'crayon croquis'
      || pencilType === 'crayons croquis'
      ) {
        itemPencilType = 'crayon de croquis';
        consoleDebug(`'crayon de croquis' found: ${itemPencilType}`);
      }

      if (pencilType === 'crayon mine'
      || pencilType === 'crayons mine'
      ) {
        itemPencilType = 'crayon mine';
        consoleDebug(`'crayon mine' found: ${itemPencilType}`);
      }

      itemPencilType = itemPencilType.replace(/crayons/g, 'crayon');
    }
  });
  consoleDebug(`itemPencilType: ${itemPencilType}`);

  const useItemPencilType = !itemPencilType && 'pencilType' in item && item.pencilType;
  consoleDebug(`use item.pencilType: ${!!useItemPencilType}`);
  if (useItemPencilType) {
    itemPencilType = item.pencilType;
    consoleDebug(`itemPencilType: ${itemPencilType}`);
  }

  itemPencilType = formatGeneralData(itemPencilType);
  consoleDebug(`return formatted itemPencilType: ${itemPencilType}`);
  return itemPencilType;
}

module.exports = extractPencilType;
