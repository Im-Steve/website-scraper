const consoleColors = require('../consoleColors');
const consoleLog = require('../consoleLog');
const saveImage = require('../func/saveImage');

async function getArchambault(page, item) {
  const consoleDebug = consoleLog.debug('archambault');
  let errorWhileScraping = false;

  console.log(consoleColors.step, 'Scrape Archambault');
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
      await page.goto(`https://www.archambault.ca/Pages/Recherche?q=${item.codeUPC}&rh=search&secq=${item.codeUPC}&sortType=1`);
    } catch (error) {
      console.log(consoleColors.error, 'Error while going to the item page');
      console.log(consoleColors.error, error);
      errorWhileScraping = true;
    }
  }

  // Check if the item was found
  if (!errorWhileScraping) {
    const isElemPresent = await page.evaluate(() => {
      const element = document.querySelector('div[data-inherit-class="product-description__img"]');
      return element !== null;
    });

    if (!isElemPresent) {
      consoleLog.error(`Not found on Archambault: ${item.codeUPC}`);
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
        const imageUrl = await page.$eval('img.slimmage', (element) => element.src);

        if (imageUrl) {
          const noImageURL = 'https://images.archambault.ca/imagesDefault/404AR.jpg?width=400';
          const imageIsSaved = await saveImage(page, imageUrl, item.internalCode, noImageURL);
          item.hasImage = imageIsSaved ? '⬇️' : '❌';
          consoleDebug(`item.hasImage: ${imageIsSaved ? '^' : 'X'}`);
        } else {
          consoleLog.error(`Image not found on Archambault: ${item.codeUPC}`);
        }
      } catch (error) {
        console.log(consoleColors.error, 'Error while extracting image from this UPC code:', item.codeUPC);
        await page.screenshot({ path: 'error_logs/archambault-saveImage-error.png' });
        console.log('See: error_logs/archambault-saveImage-error.png');
        console.log(consoleColors.error, error);
      }
    }
  }

  // consoleLog.dev('return...');
  // consoleDebug(`return: ${JSON.stringify(item, null, 2)}`);
  return item;
}

module.exports = getArchambault;
