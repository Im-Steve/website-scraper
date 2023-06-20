const cheerio = require('cheerio');

const consoleColors = require('../consoleColors');
const consoleLog = require('../consoleLog');
const { formatGeneralData } = require('../format/formatGeneralData');
const { formatInteger, formatOneMeasure } = require('../format/formatMeasures');
const saveImage = require('../func/saveImage');

async function getAmazonData(page, item) {
  const consoleDebug = consoleLog.debug('amazon');
  let errorWhileScraping = false;

  console.log(consoleColors.step, 'Scrape Amazon');
  consoleLog.dev(`UPC code: ${item.codeUPC}`);
  // consoleDebug(`item: ${JSON.stringify(item, null, 2)}`);

  if (!item.codeUPC) {
    consoleLog.error(`No UPC code for this item: ${item.internalCode}`);
    errorWhileScraping = true;
  }

  // Go to the search page
  if (!errorWhileScraping) {
    try {
      consoleLog.dev('go to the search page...');
      await page.goto(`https://www.amazon.ca/-/fr/s?k=${item.codeUPC}`);
    } catch (error) {
      console.log(consoleColors.error, 'Error while going to the search page');
      console.log(consoleColors.error, error);
      errorWhileScraping = true;
    }
  }

  // Click on the first item in the returned list
  if (!errorWhileScraping) {
    consoleLog.dev('click on the item...');
    try {
      const imgLinks = await page.$$('a.a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-normal');
      if (imgLinks && imgLinks[0]) {
        await imgLinks[0].click();
        await page.waitForNavigation();
      } else {
        consoleLog.error(`Not found on Amazon: ${item.codeUPC}`);
        errorWhileScraping = true;
        item.notOnAmazon = '❌';
      }
    } catch (error) {
      console.log(consoleColors.error, 'Error while clicking on:', item.codeUPC);
      await page.screenshot({ path: 'error_logs/amazon-search-error.png' });
      console.log('See: error_logs/amazon-search-error.png');
      console.log(consoleColors.error, error);
      errorWhileScraping = true;
      item.notOnAmazon = '❌';
    }
  }

  // Save image
  if (!errorWhileScraping) {
    consoleDebug(`item.imageLink: ${item.imageLink}`);
    consoleDebug(`save image: ${!errorWhileScraping && !item.imageLink}`);
    if (!item.imageLink) {
      consoleLog.dev('save image...');
      try {
        let imageIsFound = false;
        let imageUrl;

        if (!imageIsFound) {
          const mainImageClick = await page.$('span.a-declarative[data-action="main-image-click"]');
          if (mainImageClick) {
            await page.click('span.a-declarative[data-action="main-image-click"]');
            imageUrl = await page.$eval('#ivLargeImage img', (element) => element.src);
            if (imageUrl && !imageUrl.includes('transparent')) {
              const imageIsSaved = await saveImage(page, imageUrl, item.internalCode);
              item.hasImage = imageIsSaved ? '⬇️' : '❌';
              consoleDebug(`item.hasImage: ${imageIsSaved ? '^' : 'X'}`);
              imageIsFound = true;
            }
          }
        }

        if (!imageIsFound) {
          imageUrl = await page.$eval('#imgBlkFront', (element) => element.src);
          if (imageUrl && !imageUrl.includes('transparent')) {
            const imageIsSaved = await saveImage(page, imageUrl, item.internalCode);
            item.hasImage = imageIsSaved ? '⬇️' : '❌';
            consoleDebug(`item.hasImage: ${imageIsSaved ? '^' : 'X'}`);
            imageIsFound = true;
          }
        }

        if (!imageIsFound) {
          consoleLog.error(`Image not found on Amazon: ${item.codeUPC}`);
        }
      } catch (error) {
        console.log(consoleColors.error, 'Error while extracting image from this UPC code:', item.codeUPC);
        await page.screenshot({ path: 'error_logs/amazon-saveImage-error.png' });
        console.log('See: error_logs/amazon-saveImage-error.png');
        console.log(consoleColors.error, error);
      }
    }
  }

  const allPageDetails = [];
  const topPageDetails = {};
  const bottomPageDetails = {};
  const bottomPageV2Details = {};

  // Extract data
  if (!errorWhileScraping) {
    consoleLog.dev('extract data...');
    try {
      const html = await page.content();
      const $ = cheerio.load(html);

      // Extract data from the top of the page
      const topTable = $('table.a-normal.a-spacing-micro tr');
      topTable.each((i, row) => {
        const key = $(row).find('td:nth-child(1) span')
          .text()
          .trim()
          .toLowerCase();
        const value = $(row).find('td:nth-child(2) span')
          .text()
          .trim()
          .toLowerCase();
        topPageDetails[key] = value;
      });

      // Extract data from the bottom of the page
      const bottomTable = $('#productDetails_techSpec_section_1');
      bottomTable.find('tr').each((i, row) => {
        const key = $(row).find('th')
          .text()
          .trim()
          .toLowerCase();
        const value = $(row).find('td')
          .text()
          .trim()
          .toLowerCase();
        bottomPageDetails[key] = value;
      });

      // Extract data from the bottom v2 of the page
      const bottomTableV2 = $('ul.detail-bullet-list li');
      bottomTableV2.each((i, elem) => {
        const label = $(elem).find('.a-text-bold')
          .text()
          .trim()
          .toLowerCase();
        const value = $(elem).find('span:not(.a-text-bold)')
          .text()
          .trim()
          .toLowerCase();
        let formattedValue;

        if (label.includes('dimensions du produit') || label.includes('product dimensions')
        || label.includes('dimensions du produit l x l x h') || label.includes('product dimensions l x w x h')
        || label.includes('dimensions de l’article') || label.includes('article dimensions')
        || label.includes('dimensions de l’article l x l x h') || label.includes('article dimensions l x w x h')
        || label.includes('dimensions de l’item') || label.includes('item dimensions')
        || label.includes('dimensions de l’item l x l x h') || label.includes('item dimensions l x w x h')
        || label.includes('dimensions du colis') || label.includes('parcel dimensions')
        || label.includes('dimensions du colis l x l x h') || label.includes('parcel dimensions l x w x h')
        || label.includes('dimensions')
        || label.includes('poids du produit') || label.includes('product weight')
        || label.includes('poids de l’article') || label.includes('article weight')
        || label.includes('poids de l’item') || label.includes('item weight')
        || label.includes('poids') || label.includes('weight')) {
          formattedValue = value
            .replace(/\n/g, '')
            .replace(/dimensions du produit/g, '')
            .replace(/product dimensions/g, '')
            .replace(/dimensions de l’article/g, '')
            .replace(/article dimensions/g, '')
            .replace(/dimensions de l’item/g, '')
            .replace(/item dimensions/g, '')
            .replace(/dimensions du colis/g, '')
            .replace(/parcel dimensions/g, '')
            .replace(/dimensions/g, '')
            .replace(/l x w x h/g, '')
            .replace(/l x l x h/g, '')
            .replace(/poids du produit/g, '')
            .replace(/product weight/g, '')
            .replace(/poids de l’article/g, '')
            .replace(/article weight/g, '')
            .replace(/poids de l’item/g, '')
            .replace(/item weight/g, '')
            .replace(/poids/g, '')
            .replace(/weight/g, '')
            .replace(/‎/g, '')
            .replace(/‏/g, '')
            .replace(/:/g, '')
            .replace(/\s+/g, '');

          formattedValue = ` ${formattedValue
            .substring(0, Math.floor(formattedValue.length / 2))
            .replace(/x/g, ' x ')
            .replace(/;/g, '; ')
            .replace(/kilogrammes/g, ' kilo')
            .replace(/kilogramme/g, ' kilo')
            .replace(/kilograms/g, ' kilo')
            .replace(/kilogram/g, ' kilo')
            .replace(/grammes/g, ' grams')
            .replace(/gramme/g, ' grams')
            .replace(/gram/g, ' grams')
            .replace(/gramss/g, ' grams')
            .replace(/cm/g, ' cm')
            .replace(/centimètre/g, ' centimètres')
            .replace(/centimètress/g, ' centimètres')
            .replace(/centimetres/g, ' centimètres')
            .replace(/centimetre/g, ' centimètres')
            .replace(/centimeters/g, ' centimètres')
            .replace(/centimeter/g, ' centimètres')
            .replace(/mm/g, ' mm')
            .replace(/millimètre/g, ' millimètres')
            .replace(/millimètress/g, ' millimètres')
            .replace(/millimetres/g, ' millimètres')
            .replace(/millimetre/g, ' millimètres')
            .replace(/millimeters/g, ' millimètres')
            .replace(/millimeter/g, ' millimètres')
            .replace(/\s{2,}/g, ' ')
          }`;
        }

        if (label.includes('dimensions du produit') || label.includes('product dimensions')
        || label.includes('dimensions du produit l x l x h') || label.includes('product dimensions l x w x h')
        || label.includes('dimensions de l’article') || label.includes('article dimensions')
        || label.includes('dimensions de l’article l x l x h') || label.includes('article dimensions l x w x h')
        || label.includes('dimensions de l’item') || label.includes('item dimensions')
        || label.includes('dimensions de l’item l x l x h') || label.includes('item dimensions l x w x h')
        || label.includes('dimensions')) {
          bottomPageV2Details['dimensions du produit'] = formattedValue;
        }

        if (label.includes('dimensions du colis') || label.includes('parcel dimensions')
        || label.includes('dimensions du colis l x l x h') || label.includes('parcel dimensions l x w x h')) {
          bottomPageV2Details['dimensions du colis'] = formattedValue;
        }

        if (label.includes('poids du produit') || label.includes('product weight')
        || label.includes('poids de l’article') || label.includes('article weight')
        || label.includes('poids de l’item') || label.includes('item weight')
        || label.includes('poids') || label.includes('weight')) {
          bottomPageV2Details.poids = formattedValue.replace(/\s/g, '');
        }
      });

      allPageDetails.push(topPageDetails);
      allPageDetails.push(bottomPageDetails);
      allPageDetails.push(bottomPageV2Details);
      consoleDebug(`allPageDetails: ${JSON.stringify(allPageDetails, null, 2)}`);
    } catch (error) {
      console.log(consoleColors.error, 'Error while extracting data from this UPC code:', item.codeUPC);
      await page.screenshot({ path: 'error_logs/amazon-extract-error.png' });
      console.log('See: error_logs/amazon-extract-error.png');
      console.log(consoleColors.error, error);
      errorWhileScraping = true;
    }
  }

  // Format data
  if (!errorWhileScraping) {
    consoleLog.dev('format data...');
    try {
      let itemDimensions = ['', '', '', '', '', ''];
      let itemLength = '';
      let itemWidth = '';
      let itemHeight = '';
      let parcelDimensions = ['', '', '', '', '', ''];
      let parcelLength = '';
      let parcelWidth = '';
      let parcelHeight = '';

      let color;
      let material;
      let numberOfPieces;
      let sheetCount;
      let theme;
      let weight;

      if (item.itemLength && item.itemWidth && item.itemHeight) {
        consoleDebug('use item dimensions from item: true');
        consoleDebug(`item dimensions from item: ${item.itemLength}, ${item.itemWidth}, ${item.itemHeight}`);
        itemLength = item.itemLength;
        itemWidth = item.itemWidth;
        itemHeight = item.itemHeight;
      }

      if (!itemLength && !itemWidth && !itemHeight) {
        const itemDimensionsList = [
          'dimensions du produit',
          'dimensions du produit l x l x h',
          'product dimensions',
          'product dimensions l x w x h',
          'dimensions de l’article',
          'dimensions de l’article l x l x h',
          'article dimensions',
          'article dimensions l x w x h',
          'dimensions de l’item',
          'dimensions de l’item l x l x h',
          'item dimensions',
          'item dimensions l x w x h',
        ];

        let extractedItemDimensions = null;
        itemDimensionsList.forEach((title) => {
          if (!extractedItemDimensions) {
            extractedItemDimensions = bottomPageDetails[title]
              || bottomPageV2Details[title]
              || topPageDetails[title];
          }
        });
        consoleDebug(`extractedItemDimensions: ${extractedItemDimensions}`);

        if (extractedItemDimensions) {
          itemDimensions = extractedItemDimensions
            .substring(extractedItemDimensions[0] === ' ' ? 1 : 0)
            .replace(/‎/g, '')
            .replace(/x /g, '')
            .replace(/;/g, '')
            .split(' ');

          consoleDebug(`itemDimensions: ${itemDimensions}`);

          itemLength = itemDimensions[0] && itemDimensions[3] ? `${itemDimensions[0]} ${itemDimensions[3]}` : '';
          itemWidth = itemDimensions[1] && itemDimensions[3] ? `${itemDimensions[1]} ${itemDimensions[3]}` : '';
          itemHeight = itemDimensions[2] && itemDimensions[3] ? `${itemDimensions[2]} ${itemDimensions[3]}` : '';
        }
      }

      itemLength = formatOneMeasure(itemLength);
      itemWidth = formatOneMeasure(itemWidth);
      itemHeight = formatOneMeasure(itemHeight);
      consoleDebug(`formatted itemLength: ${itemLength}`);
      consoleDebug(`formatted itemWidth: ${itemWidth}`);
      consoleDebug(`formatted itemHeight: ${itemHeight}`);

      if (item.parcelLength && item.parcelWidth && item.parcelHeight) {
        consoleDebug('use parcel dimensions from item: true');
        consoleDebug(`parcel dimensions from item: ${item.parcelLength}, ${item.parcelWidth}, ${item.parcelHeight}`);
        parcelLength = item.parcelLength;
        parcelWidth = item.parcelWidth;
        parcelHeight = item.parcelHeight;
      }

      if (!parcelLength && !parcelWidth && !parcelHeight) {
        const parcelDimensionsList = [
          'dimensions du colis',
          'dimensions du colis l x l x h',
          'parcel dimensions',
          'parcel dimensions l x w x h',
        ];

        let extractedParcelDimensions = null;
        parcelDimensionsList.forEach((title) => {
          if (!extractedParcelDimensions) {
            extractedParcelDimensions = bottomPageDetails[title]
              || bottomPageV2Details[title]
              || topPageDetails[title];
          }
        });
        consoleDebug(`extractedParcelDimensions: ${extractedParcelDimensions}`);

        if (extractedParcelDimensions) {
          parcelDimensions = extractedParcelDimensions
            .substring(extractedParcelDimensions[0] === ' ' ? 1 : 0)
            .replace(/‎/g, '')
            .replace(/x /g, '')
            .replace(/;/g, '')
            .split(' ');

          consoleDebug(`parcelDimensions: ${parcelDimensions}`);

          parcelLength = parcelDimensions[0] && parcelDimensions[3] ? `${parcelDimensions[0]} ${parcelDimensions[3]}` : '';
          parcelWidth = parcelDimensions[1] && parcelDimensions[3] ? `${parcelDimensions[1]} ${parcelDimensions[3]}` : '';
          parcelHeight = parcelDimensions[2] && parcelDimensions[3] ? `${parcelDimensions[2]} ${parcelDimensions[3]}` : '';
        }
      }

      parcelLength = formatOneMeasure(parcelLength);
      parcelWidth = formatOneMeasure(parcelWidth);
      parcelHeight = formatOneMeasure(parcelHeight);
      consoleDebug(`formatted parcelLength: ${parcelLength}`);
      consoleDebug(`formatted parcelWidth: ${parcelWidth}`);
      consoleDebug(`formatted parcelHeight: ${parcelHeight}`);

      if (item.weight) {
        consoleDebug('use weight from item: true');
        consoleDebug(`item.weight: ${item.weight}`);
        weight = item.weight;
      }

      let extractedWeight = null;
      if (!weight) {
        const weightList = [
          'poids',
          'weight',
          'poids du produit',
          'product weight',
          'poids de l’article',
          'article weight',
          'poids de l’item',
          'item weight',
        ];

        weightList.forEach((title) => {
          if (!extractedWeight) {
            extractedWeight = bottomPageDetails[title]
              || bottomPageV2Details[title]
              || topPageDetails[title];
          }
        });
        consoleDebug(`extractedWeight: ${extractedWeight}`);

        if (!extractedWeight && itemDimensions[4]) {
          extractedWeight = `${itemDimensions[4]} ${itemDimensions.length >= 6 ? itemDimensions[5] : null}`;
          consoleDebug(`weight from itemDimensions: ${extractedWeight}`);
        } else if (!extractedWeight && parcelDimensions[4]) {
          extractedWeight = `${parcelDimensions[4]} ${parcelDimensions.length >= 6 ? parcelDimensions[5] : null}`;
          consoleDebug(`weight from parcelDimensions: ${extractedWeight}`);
        }
      }

      weight = formatOneMeasure(weight || extractedWeight);
      consoleDebug(`formatted weight: ${weight}`);

      if (item.numberOfPieces) {
        consoleDebug('use numberOfPieces from item: true');
        consoleDebug(`item.numberOfPieces: ${item.numberOfPieces}`);
        numberOfPieces = item.numberOfPieces;
      }

      if (!numberOfPieces) {
        const piecesList = [
          'nombre de pièces',
          'number of pieces',
          'nombre d’unités',
          'unit count',
          'nombre d’articles',
          'number of items',
        ];

        let extractedPieces = null;
        piecesList.forEach((title) => {
          if (!extractedPieces) {
            extractedPieces = bottomPageDetails[title]
              || bottomPageV2Details[title]
              || topPageDetails[title];
          }
        });
        consoleDebug(`extractedPieces: ${extractedPieces}`);

        numberOfPieces = formatInteger(extractedPieces);
        if (numberOfPieces && numberOfPieces > 1) {
          numberOfPieces = `${numberOfPieces} pièces`;
        } else if (numberOfPieces && numberOfPieces === 1) {
          numberOfPieces = `${numberOfPieces} pièce`;
        }
      }

      consoleDebug(`formatted numberOfPieces: ${numberOfPieces}`);

      if (item.sheetCount) {
        consoleDebug('use sheetCount from item: true');
        consoleDebug(`item.sheetCount: ${item.sheetCount}`);
        sheetCount = item.sheetCount;
      }

      if (!sheetCount) {
        const sheetList = [
          'nombre de feuilles',
          'sheet count',
        ];

        let extractedSheetCount = null;
        sheetList.forEach((title) => {
          if (!extractedSheetCount) {
            extractedSheetCount = bottomPageDetails[title]
              || bottomPageV2Details[title]
              || topPageDetails[title];
          }
        });
        consoleDebug(`extractedSheetCount: ${extractedSheetCount}`);

        sheetCount = formatInteger(extractedSheetCount);
        if (sheetCount && sheetCount > 1) {
          sheetCount = `${sheetCount} pièces`;
        } else if (sheetCount && sheetCount === 1) {
          sheetCount = `${sheetCount} pièce`;
        }
      }

      consoleDebug(`formatted sheetCount: ${sheetCount}`);

      if (item.color) {
        consoleDebug('use color from item: true');
        consoleDebug(`item.color: ${item.color}`);
        color = item.color;
      }

      let extractedColors = null;
      if (!color) {
        const colorList = [
          'couleur',
          'couleurs',
          'color',
          'colors',
        ];

        colorList.forEach((title) => {
          if (!extractedColors) {
            extractedColors = bottomPageDetails[title]
              || bottomPageV2Details[title]
              || topPageDetails[title];
          }
        });
        consoleDebug(`extractedColors: ${extractedColors}`);
      }

      color = formatGeneralData(color || extractedColors);
      consoleDebug(`formatted color: ${color}`);

      if (item.theme) {
        consoleDebug('use theme from item: true');
        consoleDebug(`item.theme: ${item.theme}`);
        theme = item.theme;
      }

      let extractedTheme = null;
      if (!theme) {
        const themeList = [
          'thème',
          'theme',
        ];

        themeList.forEach((title) => {
          if (!extractedTheme) {
            extractedTheme = bottomPageDetails[title]
              || bottomPageV2Details[title]
              || topPageDetails[title];
          }
        });
        consoleDebug(`extractedTheme: ${extractedTheme}`);
      }

      theme = formatGeneralData(theme || extractedTheme);
      consoleDebug(`formatted theme: ${theme}`);

      if (item.material) {
        consoleDebug('use material from item: true');
        consoleDebug(`item.material: ${item.material}`);
        material = item.material;
      }

      let extractedMaterial = null;
      if (!material) {
        const materialList = [
          'matériau',
          'material',
        ];

        materialList.forEach((title) => {
          if (!extractedMaterial) {
            extractedMaterial = bottomPageDetails[title]
              || bottomPageV2Details[title]
              || topPageDetails[title];
          }
        });
        consoleDebug(`extractedMaterial: ${extractedMaterial}`);
      }

      material = formatGeneralData(material || extractedMaterial);
      consoleDebug(`formatted material: ${material}`);

      const newItem = {
        itemCount: sheetCount || numberOfPieces || '',
        color,
        material,
        theme,
        length: parcelLength || itemLength,
        width: parcelWidth || itemWidth,
        height: parcelHeight || itemHeight,
        weight,
      };

      // consoleLog.dev('return...');
      // consoleDebug(`return: ${JSON.stringify(newItem, null, 2)}`);
      return {
        ...item,
        ...newItem,
        fromAmazon: JSON.stringify(newItem, null, 2),
      };
    } catch (error) {
      console.log(consoleColors.error, 'Error while formatting data from this UPC code:', item.codeUPC);
      console.log(consoleColors.error, error);
      errorWhileScraping = true;
    }
  }

  // If error while scraping item
  // consoleLog.dev('return...');
  // consoleDebug(`return: ${JSON.stringify(item, null, 2)}`);
  return item;
}

module.exports = getAmazonData;
