const pluginStealth = require('puppeteer-extra-plugin-stealth');
const puppeteer = require('puppeteer');
const puppeteerExtra = require('puppeteer-extra');

const consoleColors = require('./lib/consoleColors');
const exportExcelFile = require('./lib/func/exportExcelFile');
const { formatPrimaryData } = require('./lib/format/formatBuropro');
const getAmazonData = require('./lib/get/getAmazonData');
const getArchambault = require('./lib/get/getArchambault');
const getBuroproData = require('./lib/get/getBuroproData');
const getBarcodelookupData = require('./lib/get/getBarcodelookupData');
const getExtractedData = require('./lib/get/getExtractedData');
const getFormattedData = require('./lib/get/getFormattedData');
const getImaginaireData = require('./lib/get/getImaginaireData');
const getKidtoyData = require('./lib/get/getKidtoyData');
const importExcelFile = require('./lib/func/importExcelFile');
const logIntoBuropro = require('./lib/func/logIntoBuropro');
const notOnBuropro = require('./lib/func/notOnBuropro');
const { showDate, showElapsedTime } = require('./lib/func/showTime');
const { startRecordLogs, stopRecordLogs } = require('./lib/recordLogs');

async function scrapeWeb() {
  startRecordLogs();
  const newItemList = [];
  let numberOfCompleted = 0;
  let itemListLength = 0;

  const defaultFileNameToExport = 'itemsFromAllSources.xlsx';
  let nameOfFileToExport = defaultFileNameToExport;

  let useWebsites = false;

  let useBuropro = false;
  let checkOnBP = false;
  let useAmazon = false;
  let useImaginaire = false;
  let useKidtoy = false;
  let useBarcodelookup = false;
  let useArchambault = false;

  let forExtractedData = false;
  let forFormatting = false;
  let forImage = false;

  let useCategories = false;

  let useBasic = false;
  let useGame = false;
  let useSchool = false;

  const activatedOptions = [];

  // Set up websites and categories

  process.argv.forEach((argv) => {
    if (argv === 'buropro') {
      useBuropro = true;
      useWebsites = true;
      nameOfFileToExport = 'itemDataFromBuropro.xlsx';
      activatedOptions.push(argv);
    }
    if (argv === 'isOnBP') {
      checkOnBP = true;
      useWebsites = true;
      nameOfFileToExport = 'itemsNotOnBuropro.xlsx';
      activatedOptions.push(argv);
    }
    if (argv === 'amazon') {
      useAmazon = true;
      useWebsites = true;
      nameOfFileToExport = 'itemDataFromAmazon.xlsx';
      activatedOptions.push(argv);
    }
    if (argv === 'imaginaire') {
      useImaginaire = true;
      useWebsites = true;
      nameOfFileToExport = 'itemDataFromImaginaire.xlsx';
      activatedOptions.push(argv);
    }
    if (argv === 'kidtoy') {
      useKidtoy = true;
      useWebsites = true;
      nameOfFileToExport = 'itemDataFromKidtoy.xlsx';
      activatedOptions.push(argv);
    }
    if (argv === 'barcode') {
      useBarcodelookup = true;
      useWebsites = true;
      nameOfFileToExport = 'itemDataFromBarcodelookup.xlsx';
      activatedOptions.push(argv);
    }
    if (argv === 'archambault') {
      useArchambault = true;
      useWebsites = true;
      nameOfFileToExport = 'itemDataFromArchambault.xlsx';
      activatedOptions.push(argv);
    }
    if (argv === 'extract') {
      forExtractedData = true;
      nameOfFileToExport = 'itemsWithExtractedData.xlsx';
      activatedOptions.push(argv);
    }
    if (argv === 'format') {
      forFormatting = true;
      nameOfFileToExport = 'itemsFormatted.xlsx';
      activatedOptions.push(argv);
    }
    if (argv === 'image') {
      forImage = true;
      nameOfFileToExport = 'itemsWithoutImage.xlsx';
      activatedOptions.push(argv);
    }
    if (argv === 'basic') {
      useBasic = true;
      useCategories = true;
      activatedOptions.push(argv);
    }
    if (argv === 'game') {
      useGame = true;
      useBasic = true;
      useCategories = true;
      activatedOptions.push(argv);
    }
    if (argv === 'school') {
      useSchool = true;
      useBasic = true;
      useCategories = true;
      activatedOptions.push(argv);
    }
  });

  if (!useWebsites
  && !useCategories
  && !forExtractedData
  && !forFormatting
  ) {
    useWebsites = true;
    useBuropro = true;
    useAmazon = true;
    useImaginaire = true;
    useKidtoy = true;
    useBarcodelookup = true;
    useArchambault = true;
    forExtractedData = true;
  }

  if (useCategories
  ) {
    forExtractedData = true;
  }

  process.argv.forEach((argv) => {
    if (argv === 'x-extract') {
      forExtractedData = false;
    }
  });

  if (activatedOptions.length > 1) {
    nameOfFileToExport = defaultFileNameToExport;
  }

  // Start
  console.log(consoleColors.step, 'Start scrapeWeb();');

  // Set time
  const startTime = new Date();
  showDate(startTime);
  console.log('--------------------');

  // Import Excel file
  const itemList = importExcelFile(process.argv[2]);
  itemListLength = itemList.length;

  // Launch the browser
  let extraBrowser;
  let extraPage;
  if (useWebsites || useCategories) {
    console.log('--------------------');
    console.log(consoleColors.step, 'Launch the browser');
    console.log('launch...');

    let browserIsOpen = true;
    process.argv.forEach((argv) => {
      if (argv === 'hide') {
        browserIsOpen = false;
      }
    });

    puppeteerExtra.use(pluginStealth());
    extraBrowser = await puppeteerExtra.launch(
      {
        executablePath: puppeteer.executablePath(),
        headless: !browserIsOpen,
      },
    );
    extraPage = await extraBrowser.newPage();
    await extraPage.setViewport({ width: 1280, height: 720 });

    if (useBuropro || useBasic) {
      await logIntoBuropro(extraPage);
    }

    console.log(consoleColors.success, 'Browser ready');
    console.log('--------------------');
  }

  // Search and format all items
  console.log('--------------------');
  console.log(consoleColors.info, 'Search and format all items');
  console.log('--------------------');
  for (const item of itemList) {
    let newItem = item;
    if (useBuropro || useBasic || checkOnBP) {
      newItem = formatPrimaryData(item);
    }
    console.log(consoleColors.step, 'item:', newItem.internalCode);

    if (useBuropro || useBasic) {
      newItem = await getBuroproData(extraPage, newItem);
    }

    if (checkOnBP) {
      const notOnBP = await notOnBuropro(extraPage, newItem.internalCode);

      newItem = {
        notOnBP,
        ...newItem,
      };
    }

    if (!forImage || (forImage && !newItem.imageLink)) {
      if (!newItem.codeUPC
      && (useAmazon || useImaginaire || useKidtoy || useBarcodelookup || useArchambault)) {
        console.log(consoleColors.error2, 'No UPC code for this item:', newItem.internalCode);
      } else {
        console.log(consoleColors.step, 'UPC code:', newItem.codeUPC);
        // by priority
        if ((useKidtoy || useGame)
          && newItem.supplier === 'JOUET K.I.D. INC.'
          && (forImage ? newItem.hasImage === '❌' : true)
        ) {
          newItem = await getKidtoyData(extraPage, newItem);
        }
        if ((useArchambault || useSchool) && (forImage ? newItem.hasImage === '❌' : true)) {
          newItem = await getArchambault(extraPage, newItem);
        }
        if ((useAmazon || useBasic) && (forImage ? newItem.hasImage === '❌' : true)) {
          newItem = await getAmazonData(extraPage, newItem);
        }
        if ((useImaginaire || useGame) && (forImage ? newItem.hasImage === '❌' : true)) {
          newItem = await getImaginaireData(extraPage, newItem);
        }
        if ((useBarcodelookup || useBasic) && (forImage ? newItem.hasImage === '❌' : true)) {
          newItem = await getBarcodelookupData(extraPage, newItem);
        }
      }
      if (forExtractedData && !forImage) {
        newItem = getExtractedData(newItem);
      }

      newItem = getFormattedData(newItem);
      newItemList.push(newItem);
      exportExcelFile(newItemList, nameOfFileToExport);
    } else {
      console.log(consoleColors.info, 'this item already has an image');
    }

    numberOfCompleted += 1;
    console.log(numberOfCompleted, '/', itemListLength, 'processed items');
    console.log('--------------------');
  }
  console.log(consoleColors.success, 'Search completed');
  console.log('--------------------');

  // End
  if (extraBrowser) {
    await extraBrowser.close();
  }
  console.log('--------------------');
  showElapsedTime(startTime);
  console.log(consoleColors.info, 'Excel file created:', nameOfFileToExport);
  console.log(consoleColors.success, 'Scraping completed!');
  stopRecordLogs();
}

module.exports = scrapeWeb;
