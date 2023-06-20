const consoleColors = require('../consoleColors');
const consoleLog = require('../consoleLog');
const { formatBuroproText } = require('../format/formatBuropro');

async function getBuroproData(page, item) {
  const consoleDebug = consoleLog.debug('buropro');
  let errorWhileScraping = false;

  console.log(consoleColors.step, 'Scrape Buropro');
  // consoleDebug(`item: ${JSON.stringify(item, null, 2)}`);

  // Go to the search page
  if (!errorWhileScraping) {
    try {
      consoleLog.dev('go to the search page...');
      await page.goto('https://www.buroprocitation.ca/admin/Ecommerce/ProductWebForm.aspx?Id=2dd92a5a-9fb2-4998-9494-b591a6b8128d');
    } catch (error) {
      console.log(consoleColors.error, 'Error while going to the search page');
      console.log(consoleColors.error, error);
      errorWhileScraping = true;
    }
  }

  // Search with the search bar
  consoleLog.dev('search with the search bar...');
  try {
    let searchButton = await page.$('#oucToolbar_cmdOpen');
    await searchButton.click();
    await page.type('input[name="oucToolbar$txtOpenCode"]', item.internalCode.toString());
    searchButton = await page.$('#oucToolbar_cmdOpenCode');
    await searchButton.click();
    await page.waitForNavigation();
  } catch (error) {
    console.log(consoleColors.error, 'Error while using the search bar with:', item.internalCode);
    await page.screenshot({ path: 'error_logs/buropro-search-error.png' });
    console.log('See: error_logs/buropro-search-error.png');
    console.log(consoleColors.error, error);
    errorWhileScraping = true;
  }

  // Check if the item exists
  if (!errorWhileScraping) {
    const itemNotExists = await page.$('#EasyEcomStatusBar');
    if (itemNotExists) {
      consoleLog.error(`Not found on Buropro: ${item.internalCode}`);
      errorWhileScraping = true;
    }
  }

  // Extract data
  if (!errorWhileScraping) {
    consoleLog.dev('extract data...');
    try {
      await page.select('#lstCultureDescription', 'fr-CA');

      let pageLoaded = false;
      let numberOfAttempts = 0;
      let codeUPC;
      while (!pageLoaded && numberOfAttempts < 10) {
        try {
          codeUPC = await page.$eval('#txtCodeUPC_txt', (input) => input.value);
          consoleDebug(`codeUPC: ${codeUPC}`);
          pageLoaded = true;
        } catch (error) {
          consoleDebug('page loading...');
          pageLoaded = false;
          numberOfAttempts += 1;
          await page.waitForTimeout(2000);
        }
      }

      const title = await page.$eval('#txtTitle_txt', (input) => input.value);
      consoleDebug(`title: ${title}`);

      let description = await page.evaluate(() => {
        const descriptionElem = document.querySelector('textarea[name="txtDescription"]');
        return descriptionElem.value;
      });
      description = formatBuroproText(description);
      consoleDebug(`description: ${description}`);

      let imageLink = await page.evaluate(() => {
        const imgElement = document.getElementById('rptProductPicture_ctl00_oucProductPictures_oucProductPictureLarge_imgProduct');
        return imgElement.src;
      });
      if (imageLink === 'https://www.buroprocitation.ca/ecom_theme/img/no_picture/product_small.gif') {
        imageLink = '';
      }
      consoleDebug(`imageLink: ${imageLink}`);

      const hasImage = imageLink ? '✔️' : '❌';
      consoleDebug(`hasImage: ${imageLink ? 'V' : 'X'}`);

      const supplier = await page.$eval('#txtSupplierModal_txtModalSearch', (input) => input.value);
      consoleDebug(`supplier: ${supplier}`);

      const newItem = {
        internalCode: item.internalCode,
        title,
        description,
        imageLink,
        hasImage,
        codeUPC,
        amazonLink: codeUPC ? `https://www.amazon.ca/-/fr/s?k=${codeUPC}` : '',
        googleLink: codeUPC ? `https://www.google.ca/search?q=${codeUPC}` : '',
        supplier,
        ...item,
      };

      // consoleLog.dev('return...');
      // consoleDebug(`return: ${JSON.stringify(newItem, null, 2)}`);
      return newItem;
    } catch (error) {
      console.log(consoleColors.error, 'Error while extracting data from:', item.internalCode);
      await page.screenshot({ path: 'error_logs/buropro-extract-error.png' });
      console.log('See: error_logs/buropro-oneItem-error.png');
      console.log(consoleColors.error, error);
      errorWhileScraping = true;
    }
  }

  // If error while scraping item
  // consoleLog.dev('return...');
  // consoleDebug(`return: ${JSON.stringify(item, null, 2)}`);
  return item;
}

module.exports = getBuroproData;
