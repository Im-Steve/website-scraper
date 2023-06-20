const consoleColors = require('../consoleColors');
const consoleLog = require('../consoleLog');
const { formatOneMeasure } = require('../format/formatMeasures');
const saveImage = require('../func/saveImage');
const unitOfMeasureList = require('../lists/unitOfMeasureList');

async function getBarcodelookupData(page, item) {
  const consoleDebug = consoleLog.debug('barcode');
  let errorWhileScraping = false;

  console.log(consoleColors.step, 'Scrape Barcode Lookup');
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
      await page.goto(`https://www.barcodelookup.com/${item.codeUPC}`);
      await page.waitForTimeout(2000);
    } catch (error) {
      console.log(consoleColors.error, 'Error while going to the item page');
      console.log(consoleColors.error, error);
      errorWhileScraping = true;
    }
  }

  // Check if the item was found
  if (!errorWhileScraping) {
    const isElemPresent = await page.evaluate(() => {
      const element = document.querySelector('#largeProductImage');
      return element !== null;
    });

    if (!isElemPresent) {
      consoleLog.error(`Not found on Barcode Lookup: ${item.codeUPC}`);
      errorWhileScraping = true;
    }
  }

  // Save image
  if (!errorWhileScraping) {
    consoleDebug(`item.imageLink: ${item.imageLink}`);
    consoleDebug(`item.hasImage: ${item.hasImage}`);
    consoleDebug(`save image: ${!errorWhileScraping && !item.imageLink && item.hasImage !== '⬇️'}`);
    if (!item.imageLink && item.hasImage !== '⬇️') {
      consoleLog.dev('save image...');
      try {
        const imageUrl = await page.$eval('#largeProductImage img', (element) => element.src);

        if (imageUrl) {
          const imageIsSaved = await saveImage(page, imageUrl, item.internalCode);
          item.hasImage = imageIsSaved ? '⬇️' : '❌';
          consoleDebug(`item.hasImage: ${imageIsSaved ? '^' : 'X'}`);
        } else {
          consoleLog.error(`Image not found on Barcode Lookup: ${item.codeUPC}`);
        }
      } catch (error) {
        console.log(consoleColors.error, 'Error while extracting image from this UPC code:', item.codeUPC);
        await page.screenshot({ path: 'error_logs/barcodelookup-saveImage-error.png' });
        console.log('See: error_logs/barcodelookup-saveImage-error.png');
        console.log(consoleColors.error, error);
      }
    }
  }

  // Extract data
  if (!errorWhileScraping) {
    consoleLog.dev('extract data...');
    try {
      // Extract description
      consoleLog.dev('extract description...');
      let description;
      const itemDescription = 'description' in item ? item.description : '';

      let webDescription = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('.product-meta-data'));
        return elements.map((element) => element.innerHTML).join('\n');
      });
      webDescription = webDescription
        && webDescription
          .replace(/<[^>]+>/g, '')
          .replace(/Description:/g, '')
          .replace(/\r?\n|\r/g, ' ')
          .replace(/&nbsp;|'/g, '');
      consoleDebug(`description from the web: ${webDescription}`);

      if (webDescription) {
        consoleLog.dev('format description...');
        description = `${itemDescription} /---/ BARCODE LOOKUP description: ${webDescription}`;
        consoleDebug(`item desc + BARCODE desc: ${description}`);
      } else {
        description = itemDescription;
      }

      // Extract dimensions
      consoleLog.dev('extract dimensions...');
      let dimensions;
      let barcodeDimensions;
      let unit = '"';

      const regex = /dimensions?\s*:?\s*([\d.,]+)(.*?[xX].*?)([\d.,]+)(.*?[xX].*?)(?:([\d.,]+))(?:(.{0,15}))/i;
      const matches = webDescription.toLowerCase().match(regex);
      consoleDebug(`matches.length: ${matches && matches.length}`);
      consoleDebug(`matches: ${JSON.stringify(matches, null, 2)}`);

      consoleLog.dev('format dimensions...');

      if (matches && matches.length === 7) {
        matches[2] = matches[2].normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        matches[4] = matches[4].normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        matches[6] = matches[6].normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        unitOfMeasureList.forEach((unitOfMeasure) => {
          const normalizedUnit = unitOfMeasure.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

          if (matches[2].includes(normalizedUnit)
          || matches[4].includes(normalizedUnit)
          || matches[6].includes(normalizedUnit)
          ) {
            unit = unitOfMeasure;
          }
        });

        barcodeDimensions = {
          length: `${matches[1]} ${unit}`,
          width: `${matches[3]} ${unit}`,
          height: `${matches[5]} ${unit}`,
        };
        consoleDebug(`barcodeDimensions: ${JSON.stringify(barcodeDimensions, null, 2)}`);
      }

      const itemDimensions = {
        length: 'length' in item ? item.length : null,
        width: 'width' in item ? item.width : null,
        height: 'height' in item ? item.height : null,
      };
      consoleDebug(`itemDimensions: ${JSON.stringify(itemDimensions, null, 2)}`);

      if (itemDimensions.length && itemDimensions.width && itemDimensions.height) {
        dimensions = {
          length: itemDimensions.length,
          width: itemDimensions.width,
          height: itemDimensions.height,
        };
      } else if (
        barcodeDimensions
        && barcodeDimensions.length && barcodeDimensions.width && barcodeDimensions.height
      ) {
        dimensions = {
          length: barcodeDimensions.length,
          width: barcodeDimensions.width,
          height: barcodeDimensions.height,
        };
      } else {
        dimensions = {
          length: itemDimensions.length,
          width: itemDimensions.width,
          height: itemDimensions.height,
        };
      }
      consoleDebug(`dimensions: ${JSON.stringify(dimensions, null, 2)}`);

      dimensions.length = formatOneMeasure(dimensions.length);
      dimensions.width = formatOneMeasure(dimensions.width);
      dimensions.height = formatOneMeasure(dimensions.height);

      const newItem = {
        description,
        ...dimensions,
      };

      // consoleLog.dev('return...');
      // consoleDebug(`return: ${JSON.stringify(newItem, null, 2)}`);
      return {
        ...item,
        ...newItem,
        fromBarcodeLookup: JSON.stringify(newItem, null, 2),
      };
    } catch (error) {
      console.log(consoleColors.error, 'Error while extracting data from this UPC code:', item.codeUPC);
      await page.screenshot({ path: 'error_logs/barcodelookup-extract-error.png' });
      console.log('See: error_logs/barcodelookup-extract-error.png');
      console.log(consoleColors.error, error);
      errorWhileScraping = true;
    }
  }

  // If error while scraping item
  // consoleLog.dev('return...');
  // consoleDebug(`return: ${JSON.stringify(item, null, 2)}`);
  return item;
}

module.exports = getBarcodelookupData;
