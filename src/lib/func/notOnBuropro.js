const consoleColors = require('../consoleColors');
const consoleLog = require('../consoleLog');

async function notOnBuropro(page, internalCode) {
  const consoleDebug = consoleLog.debug('isOnBP');
  let errorWhileScraping = false;

  console.log(consoleColors.step, 'Check on the public Buropro');

  let notOnBP = '‼️';

  // Go to the item page
  if (!errorWhileScraping) {
    try {
      consoleLog.dev('go to the item page...');
      await page.goto(`https://www.buroprocitation.ca/recherche-produits?QuickSearchCategories=kcallcategories&qs=${internalCode}`);
    } catch (error) {
      console.log(consoleColors.error, 'Error while going to the item page');
      console.log(consoleColors.error, error);
      errorWhileScraping = true;
      notOnBP = '‼️';
    }
  }

  // Check if the item exists
  if (!errorWhileScraping) {
    try {
      const content = await page.content();
      const isNotFound = content.includes('Aucun produit trouvé');

      if (isNotFound) {
        notOnBP = '❌';
        consoleDebug('not found');
      } else {
        notOnBP = '';
        consoleDebug('found');
      }
    } catch (error) {
      console.log(consoleColors.error, 'Error while checking the item page');
      console.log(consoleColors.error, error);
      errorWhileScraping = true;
      notOnBP = '‼️';
    }
  }

  consoleDebug(`notOnBP: ${notOnBP.replace(/❌/g, 'X').replace(/‼️/g, '!!')}`);
  return notOnBP;
}

module.exports = notOnBuropro;
