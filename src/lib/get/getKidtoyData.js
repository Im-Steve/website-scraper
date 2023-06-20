const cheerio = require('cheerio');

const consoleColors = require('../consoleColors');
const consoleLog = require('../consoleLog');
const { formatOneMeasure } = require('../format/formatMeasures');
const saveImage = require('../func/saveImage');

async function getKidtoyData(page, item) {
  const consoleDebug = consoleLog.debug('kidtoy');
  let errorWhileScraping = false;

  console.log(consoleColors.step, 'Scrape Kidtoy');
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
      await page.goto(`https://www.kidtoy.ca/produits2.asp?s=${item.codeUPC}&langid=2`);
    } catch (error) {
      console.log(consoleColors.error, 'Error while going to the item page');
      console.log(consoleColors.error, error);
      errorWhileScraping = true;
    }
  }

  // Check if the item was found
  if (!errorWhileScraping) {
    const isElemPresent = await page.evaluate(() => {
      const element = document.querySelector('.no_mobi.Helvetica18.FItemColor');
      return element !== null;
    });

    if (!isElemPresent) {
      consoleLog.error(`Not found on Kidtoy: ${item.codeUPC}`);
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
        const imageUrl = await page.$eval('ul.slides img', (element) => element.src);

        if (imageUrl) {
          const imageIsSaved = await saveImage(page, imageUrl, item.internalCode);
          item.hasImage = imageIsSaved ? '⬇️' : '❌';
          consoleDebug(`item.hasImage: ${imageIsSaved ? '^' : 'X'}`);
        } else {
          consoleLog.error(`Image not found on kidtoy: ${item.codeUPC}`);
        }
      } catch (error) {
        console.log(consoleColors.error, 'Error while extracting image from this UPC code:', item.codeUPC);
        await page.screenshot({ path: 'error_logs/kidtoy-saveImage-error.png' });
        console.log('See: error_logs/kidtoy-saveImage-error.png');
        console.log(consoleColors.error, error);
      }
    }
  }

  // Extract data
  if (!errorWhileScraping) {
    consoleLog.dev('extract data...');
    try {
      const html = await page.content();
      const $ = cheerio.load(html);

      // Extract description
      consoleLog.dev('extract description...');
      let description;
      const itemDescription = 'description' in item ? item.description : '';

      let webDescription;
      const descDiv = await page.$('.no_mobi.Helvetica18.FItemColor');
      if (descDiv) {
        webDescription = await page.evaluate((element) => element.innerHTML, descDiv);
        webDescription = webDescription
          && webDescription
            .replace(/<\/?.*?\/?>/g, ' ')
            .replace(/\r?\n|\r/g, ' ')
            .replace(/&nbsp;|'/g, '');
      }
      consoleDebug(`description from the web: ${webDescription}`);

      if (webDescription) {
        consoleLog.dev('format description...');
        description = `${itemDescription} /---/ KIDTOY description: ${webDescription}`;
        consoleDebug(`item desc + KID desc: ${description}`);
      } else {
        description = itemDescription;
      }

      // Extract dimensions
      consoleLog.dev('extract dimensions...');
      const techData = {};
      const techTable = $('#FItemTechDetails tr');
      techTable.each((i, row) => {
        const key = $(row).find('td:nth-child(1)')
          .text()
          .trim()
          .replace(':', '');
        const value = $(row).find('td:nth-child(2)')
          .text()
          .trim()
          .replace(':', '');
        techData[key] = value;
      });
      consoleDebug(`techData: ${JSON.stringify(techData, null, 2)}`);

      consoleLog.dev('format dimensions...');
      let dimensions;

      const itemDimensions = {
        length: 'length' in item ? item.length : null,
        width: 'width' in item ? item.width : null,
        height: 'height' in item ? item.height : null,
        weight: 'weight' in item ? item.weight : null,
      };
      consoleDebug(`itemDimensions: ${JSON.stringify(itemDimensions, null, 2)}`);

      const kidDimensions = {
        length: 'Longueur' in techData ? techData.Longueur : null,
        width: 'Largeur' in techData ? techData.Largeur : null,
        height: 'Hauteur' in techData ? techData.Hauteur : null,
        weight: 'Poids' in techData ? techData.Poids : null,
      };
      consoleDebug(`kidDimensions: ${JSON.stringify(kidDimensions, null, 2)}`);

      Object.keys(kidDimensions).forEach((key) => {
        let dimension = kidDimensions[key];
        dimension = dimension && dimension[0] === '0' ? null : dimension;
        dimension = dimension && dimension[0] === '-' ? null : dimension;
        kidDimensions[key] = dimension;
      });
      consoleDebug(`clean kidDimensions: ${JSON.stringify(kidDimensions, null, 2)}`);

      if (itemDimensions.length && itemDimensions.width && itemDimensions.height) {
        dimensions = {
          length: itemDimensions.length,
          width: itemDimensions.width,
          height: itemDimensions.height,
        };
      } else if (
        kidDimensions
        && kidDimensions.length && kidDimensions.width && kidDimensions.height
      ) {
        dimensions = {
          length: kidDimensions.length,
          width: kidDimensions.width,
          height: kidDimensions.height,
        };
      } else {
        dimensions = {
          length: itemDimensions.length,
          width: itemDimensions.width,
          height: itemDimensions.height,
        };
      }

      dimensions = {
        ...dimensions,
        weight: kidDimensions.weight || itemDimensions.weight,
      };
      consoleDebug(`dimensions: ${JSON.stringify(dimensions, null, 2)}`);

      dimensions.length = formatOneMeasure(dimensions.length);
      dimensions.width = formatOneMeasure(dimensions.width);
      dimensions.height = formatOneMeasure(dimensions.height);
      dimensions.weight = formatOneMeasure(dimensions.weight);

      const newItem = {
        description,
        ...dimensions,
      };

      // consoleLog.dev('return...');
      // consoleDebug(`return: ${JSON.stringify(newItem, null, 2)}`);
      return {
        ...item,
        ...newItem,
        fromKidToy: JSON.stringify(newItem, null, 2),
      };
    } catch (error) {
      console.log(consoleColors.error, 'Error while extracting data from this UPC code:', item.codeUPC);
      await page.screenshot({ path: 'error_logs/kidtoy-extract-error.png' });
      console.log('See: error_logs/kidtoy-extract-error.png');
      console.log(consoleColors.error, error);
      errorWhileScraping = true;
    }
  }

  // If error while scraping item
  // consoleLog.dev('return...');
  // consoleDebug(`return: ${JSON.stringify(item, null, 2)}`);
  return item;
}

module.exports = getKidtoyData;
