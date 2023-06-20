const puppeteerExtra = require('puppeteer-extra');

const consoleColors = require('./lib/consoleColors');
const exportExcelFile = require('./lib/func/exportExcelFile');

const nameOfFileWithAllItems = 'buroproOnePageItems.xlsx';
const nameOfFileWithoutImage = 'buroproOnePageItemsWitoutImage.xlsx';

async function listBuroproPage() {
  // Start
  console.log(consoleColors.step, 'Start listBuroproPage();');
  console.log('--------------------');

  // Launch the browser
  console.log('--------------------');
  console.log(consoleColors.step, 'Launch the browser');
  console.log('launch...');

  let browserIsOpen = true;
  process.argv.forEach((argv) => {
    if (argv === 'hide') {
      browserIsOpen = false;
    }
  });

  const browser = await puppeteerExtra.launch({ headless: !browserIsOpen });
  const page = await browser.newPage();
  await page.goto(process.argv[2]);
  console.log(consoleColors.success, 'Browser ready');
  console.log('--------------------');

  // Load all items
  console.log('--------------------');
  console.log(consoleColors.step, 'Load all items');

  let stopLoading = await page.evaluate(() => {
    const button = document.querySelector('#ListingViewMore[style*="display: block; visibility: hidden;"]');
    return button !== null;
  });

  while (!stopLoading) {
    try {
      await page.click('#cmdViewMore');
      console.log('load new items...');
    } catch (error) {
      console.log(consoleColors.info, 'page in load...');
    }

    await page.waitForTimeout(1000);
    stopLoading = await page.evaluate(() => {
      const button = document.querySelector('#ListingViewMore[style*="display: block; visibility: hidden;"]');
      return button !== null;
    });
  }

  console.log(consoleColors.success, 'All items are loaded');
  console.log('--------------------');

  // List all items
  console.log('--------------------');
  console.log(consoleColors.step, 'List all items');
  console.log('work in progress...');

  const itemsWithoutImage = [];

  const allItems = await page.$$eval('.ejs-productitem', (items) => {
    const filteredItems = [];

    for (const item of items) {
      let hasImage = true;
      const productBox = item.querySelector('.boxshad.productbox');
      if (
        productBox
        && productBox.querySelector('.box-photo img')?.src
          === 'https://buroprocitation-2.azureedge.net/ImagesEcom/products/no_picture/product_default.gif?fv=EDCD23C32A8D98C28969BF64E28AE659-9673'
      ) {
        hasImage = false;
      }

      const productCode = productBox.querySelector('.box-info ul li.product-code');
      if (productCode) {
        filteredItems.push({
          internalCode:
            productCode.textContent
              .trim()
              .replace(/\(.*?\)/g, '')
              .replace(/\r?\n|\r/g, '')
              .replace(/\s+/g, ''),
          hasImage: hasImage ? '✔️' : '❌',
        });
      }
    }

    return filteredItems;
  });

  for (const item of allItems) {
    if (item.hasImage === '❌') {
      itemsWithoutImage.push(item);
    }
  }

  console.log(consoleColors.success, 'Search completed');
  console.log('--------------------');

  // End
  await browser.close();
  console.log('--------------------');
  exportExcelFile(allItems, nameOfFileWithAllItems);
  console.log(consoleColors.info, 'Excel file created:', nameOfFileWithAllItems);
  exportExcelFile(itemsWithoutImage, nameOfFileWithoutImage);
  console.log(consoleColors.info, 'Excel file created:', nameOfFileWithoutImage);
  console.log(consoleColors.success, 'Task completed!');
}

module.exports = listBuroproPage;
