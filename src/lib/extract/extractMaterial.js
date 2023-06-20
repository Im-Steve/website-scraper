const consoleLog = require('../consoleLog');
const { formatGeneralData } = require('../format/formatGeneralData');
const materialList = require('../lists/materialList');

function extractMaterial(item) {
  const consoleDebug = consoleLog.debug('material');
  let allMaterials = '';
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

  consoleLog.dev('extract material...');
  consoleDebug(`title: ${title}`);
  consoleDebug(`description: ${description}`);

  let continueWithTheMaterial;
  materialList.forEach((material) => {
    continueWithTheMaterial = true;
    const normalizedMaterial = material.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if (title.includes(normalizedMaterial) || description.includes(normalizedMaterial)) {
      if (continueWithTheMaterial && !allMaterials.includes(material)) {
        allMaterials = allMaterials === '' ? material : `${allMaterials}, ${material}`;
        continueWithTheMaterial = false;
        consoleDebug(`new material: ${material}`);
      }
    }
  });
  consoleDebug(`allMaterials: ${allMaterials}`);

  const useItemMaterial = allMaterials === '' && 'material' in item && item.material;
  consoleDebug(`use item.material: ${!!useItemMaterial}`);
  if (useItemMaterial) {
    allMaterials = item.material;
    consoleDebug(`allMaterials: ${allMaterials}`);
  }

  allMaterials = formatGeneralData(allMaterials);
  consoleDebug(`return formatted allMaterials: ${allMaterials}`);
  return allMaterials;
}

module.exports = extractMaterial;
