const listBuroproPage = require('./src/listBuroproPage');
const scrapeWeb = require('./src/scrapeWeb');

argv2 = process.argv.length >= 3 && process.argv[2];
showUsage = argv2 === 'usage';

if (process.argv.length >= 3 && (argv2.includes('.xlsx') || argv2.includes('.xls'))) {
    scrapeWeb();
} else if (process.argv.length >= 3 && argv2.includes('www.buroprocitation.ca')) {
    listBuroproPage();
} else if (!showUsage) {
  console.error('Error: Invalid use of arguments');
  showUsage = true;
}

if (showUsage) {
  console.log(
    'Usage: node website-scraper.js <EXCEL FILE PATH or BUROPRO URL>\n',
    'Options:\n',
    '\t<CATEGORIES>: Scrape websites from given categories\n',
    '\t\t- basic\n',
    '\t\t- game\n',
    '\t\t- school\n',
    '\t<WEBSITES>: Scrape only given websites\n',
    '\t\tnote: adding a website disables "extract" if not set\n',
    '\t\t- buropro\n',
    '\t\t- amazon\n',
    '\t\t- imaginaire\n',
    '\t\t- kidtoy\n',
    '\t\t- barcode\n',
    '\t\t- archambault\n',
    '\t<ACTIONS>: Perform only given actions\n',
    '\t\t- extract\n',
    '\t\t- x-extract (disable extract)\n',
    '\t\t- format\n',
    '\t\t- image\n',
    '\thide: Hide the browser when scraping (not recommended)\n',
    '\tqt1: Assign 1 to empty item counts\n',
    '\tisOnBP: Check if the items are available on the Buropro public site\n',
    '\tdev: Show dev level logs\n',
    '\tdebug <MODULES>: Show debug level logs of given modules\n',
    '\tdebug-all: Show all debug level logs'
  );
}

if (process.argv.length < 3 || showUsage) {
  process.exit();
}
