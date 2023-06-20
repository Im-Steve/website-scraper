const consoleColors = require('../consoleColors');
const consoleLog = require('../consoleLog');
const saveImage = require('../func/saveImage');

async function getImaginaireData(page, item) {
  const consoleDebug = consoleLog.debug('imaginaire');
  let errorWhileScraping = false;

  console.log(consoleColors.step, 'Scrape Imaginaire');
  consoleLog.dev(`UPC code: ${item.codeUPC}`);
  // consoleDebug(`item: ${JSON.stringify(item, null, 2)}`);

  if (!item.codeUPC) {
    consoleLog.error(`No UPC code for this item: ${item.internalCode}`);
    errorWhileScraping = true;
  }

  // Go to the item page
  if (!errorWhileScraping) {
    try {
      consoleLog.dev('go to the item page...');
      await page.goto(`https://imaginaire.com/fr/catalogsearch/result.html?q=${item.codeUPC}`);
    } catch (error) {
      console.log(consoleColors.error, 'Error while going to the item page');
      console.log(consoleColors.error, error);
      errorWhileScraping = true;
    }
  }

  // Check if the item was found
  if (!errorWhileScraping) {
    const isElemPresent = await page.evaluate(() => {
      const element = document.querySelector('#descr');
      return element !== null;
    });

    if (!isElemPresent) {
      consoleLog.error(`Not found on Imaginaire: ${item.codeUPC}`);
      errorWhileScraping = true;
    }
  }

  // Save image
  if (!errorWhileScraping) {
    consoleDebug(`item.imageLink: ${item.imageLink}`);
    consoleDebug(`save image: ${!errorWhileScraping && !item.imageLink}`);
    if (!item.imageLink) {
      consoleLog.dev('save image...');
      try {
        const imageUrl = await page.$eval('img[itemprop="image"', (element) => element.src);

        if (imageUrl) {
          const imageIsSaved = await saveImage(page, imageUrl, item.internalCode);
          item.hasImage = imageIsSaved ? '⬇️' : '❌';
          consoleDebug(`item.hasImage: ${imageIsSaved ? '^' : 'X'}`);
        } else {
          consoleLog.error(`Image not found on Imaginaire: ${item.codeUPC}`);
        }
      } catch (error) {
        console.log(consoleColors.error, 'Error while extracting image from this UPC code:', item.codeUPC);
        await page.screenshot({ path: 'error_logs/imaginaire-saveImage-error.png' });
        console.log('See: error_logs/imaginaire-saveImage-error.png');
        console.log(consoleColors.error, error);
      }
    }
  }

  // Extract data
  if (!errorWhileScraping) {
    consoleLog.dev('extract data...');
    try {
      let description;
      const itemDescription = 'description' in item ? item.description : '';

      let webDescription;
      const descDiv = await page.$('#descr');
      if (descDiv) {
        webDescription = await page.evaluate(() => {
          const balise = document.querySelector('#descr');
          return balise.innerText.replace(/\r?\n|\r/g, ' ');
        });
      }
      consoleDebug(`description from the web: ${webDescription}`);

      if (webDescription) {
        consoleLog.dev('format description...');
        description = `${itemDescription} /---/ IMAGINAIRE description: ${webDescription}`;
        consoleDebug(`item desc + IMAGINAIRE desc: ${description}`);
      } else {
        description = itemDescription;
      }

      const newItem = {
        description,
      };

      // consoleLog.dev('return...');
      // consoleDebug(`return: ${JSON.stringify(newItem, null, 2)}`);
      return {
        ...item,
        ...newItem,
        fromImaginaire: JSON.stringify(newItem, null, 2),
      };
    } catch (error) {
      console.log(consoleColors.error, 'Error while extracting data from this UPC code:', item.codeUPC);
      await page.screenshot({ path: 'error_logs/imaginaire-extract-error.png' });
      console.log('See: error_logs/imaginaire-extract-error.png');
      console.log(consoleColors.error, error);
      errorWhileScraping = true;
    }
  }

  // If error while scraping item
  // consoleLog.dev('return...');
  // consoleDebug(`return: ${JSON.stringify(item, null, 2)}`);
  return item;
}

module.exports = getImaginaireData;
