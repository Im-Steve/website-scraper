const consoleLog = require('../consoleLog');
const { formatInteger } = require('../format/formatMeasures');

function extractNumberOfPieces(item) {
  const consoleDebug = consoleLog.debug('pieces');
  let extractedNumber = null;
  let numberOfPieces = null;
  const title = 'title' in item && typeof item.title === 'string'
    ? item.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') : '';
  const description = 'description' in item && typeof item.description === 'string'
    ? item.description
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') : '';

  consoleLog.dev('extract number of pieces...');
  consoleDebug(`title: ${title}`);
  consoleDebug(`description: ${description}`);

  // Search number before text from title
  if (!numberOfPieces) {
    extractedNumber = title.match(/(\d+)(?=\s*piece)/i)
    || title.match(/(\d+)(?=\s*ass.)/i)
    || title.match(/(\d+)(?=\s*\/\s*pqt)/i)
    || title.match(/(\d+)(?=\s*mcx)/i)
    || title.match(/(\d+)(?=\s*perles?)/i)
    || title.match(/(\d+)(?=\s*pearls?)/i)
    || title.match(/(\d+)(?=\s*pc)/i);

    numberOfPieces = extractedNumber;
    consoleDebug(`numberOfPieces before text from title: ${numberOfPieces}`);
  }

  // Search number after text from title
  if (!numberOfPieces) {
    extractedNumber = title.match(/ensemble de\s*(\d+)/i)
    || title.match(/ens.? de\s*(\d+)/i)
    || title.match(/set of\s*(\d+)/i)
    || title.match(/pqt.\s*(\d+)/i)
    || title.match(/nombres? de diamants?\s*:\s*(\d+)/i)
    || title.match(/numbers? of diamonds?\s*:\s*(\d+)/i)
    || title.match(/nombres? de dotz\s*:\s*(\d+)/i)
    || title.match(/numbers? of dotz\s*:\s*(\d+)/i)
    || title.match(/boite de\s*:?\s*(\d+)/i)
    || title.match(/box of\s*:?\s*(\d+)/i)
    || title.match(/lot de\s*:?\s*(\d+)/i)
    || title.match(/lot of\s*:?\s*(\d+)/i)
    || title.match(/paquet de\s*:?\s*(\d+)/i)
    || title.match(/pack of\s*:?\s*(\d+)/i)
    || title.match(/paquet\s*:?\s*(\d+)/i)
    || title.match(/pack\s*:?\s*(\d+)/i)
    || title.match(/pqt de\s*:?\s*(\d+)/i)
    || title.match(/pqt\s*:?\s*(\d+)/i)
    || title.match(/(\d+)\s*x\s*(?:\d+)\s*ml/) // if with ml
    || title.match(/@\s*(\d+)/i)
    || title.match(/\((\d+)\)/);

    numberOfPieces = extractedNumber && extractedNumber.length >= 2 ? extractedNumber[1] : null;
    consoleDebug(`numberOfPieces after text from title: ${numberOfPieces}`);
  }

  // Search number before text from desc
  if (!numberOfPieces) {
    extractedNumber = description.match(/(\d+)(?=\s*piece)/i)
    || description.match(/(\d+)(?=\s*ass.)/i)
    || description.match(/(\d+)(?=\s*\/\s*pqt)/i)
    || description.match(/(\d+)(?=\s*mcx)/i)
    || description.match(/(\d+)(?=\s*perles?)/i)
    || description.match(/(\d+)(?=\s*pearls?)/i)
    || description.match(/(\d+)(?=\s*pc)/i);

    numberOfPieces = extractedNumber;
    consoleDebug(`numberOfPieces before text from desc: ${numberOfPieces}`);
  }

  // Search number after text from desc
  if (!numberOfPieces) {
    extractedNumber = description.match(/ensemble de\s*(\d+)/i)
    || description.match(/ens.? de\s*(\d+)/i)
    || description.match(/set of\s*(\d+)/i)
    || description.match(/pqt.\s*(\d+)/i)
    || description.match(/nombres? de diamants?\s*:\s*(\d+)/i)
    || description.match(/numbers? of diamonds?\s*:\s*(\d+)/i)
    || description.match(/nombres? de dotz\s*:\s*(\d+)/i)
    || description.match(/numbers? of dotz\s*:\s*(\d+)/i)
    || description.match(/boite de\s*:?\s*(\d+)/i)
    || description.match(/box of\s*:?\s*(\d+)/i)
    || description.match(/lot de\s*:?\s*(\d+)/i)
    || description.match(/lot of\s*:?\s*(\d+)/i)
    || description.match(/paquet de\s*:?\s*(\d+)/i)
    || description.match(/pack of\s*:?\s*(\d+)/i)
    || description.match(/paquet\s*:?\s*(\d+)/i)
    || description.match(/pack\s*:?\s*(\d+)/i)
    || description.match(/pqt de\s*:?\s*(\d+)/i)
    || description.match(/pqt\s*:?\s*(\d+)/i)
    || description.match(/(\d+)\s*x\s*(?:\d+)\s*ml/) // if with ml
    || description.match(/@\s*(\d+)/i)
    || description.match(/\((\d+)\)/);

    numberOfPieces = extractedNumber && extractedNumber.length >= 2 ? extractedNumber[1] : null;
    consoleDebug(`numberOfPieces after text from desc: ${numberOfPieces}`);
  }

  // Search for a number at the beginning
  // if (!numberOfPieces) {
  //   const slicedTitle = title.slice(0, 15);
  //   const slicedDesc = description.slice(0, 15);

  //   extractedNumber = !slicedTitle.includes('ans') ? slicedTitle.match(/\d+/g) : null;
  //   if (!extractedNumber) {
  //     extractedNumber = !slicedDesc.includes('ans') ? slicedDesc.match(/\d+/g) : null;
  //   }

  //   numberOfPieces = extractedNumber;
  //   consoleDebug(`numberOfPieces from beginning: ${numberOfPieces}`);
  // }

  // Removed because we are now using itemCount
  // const useItemPieces = !numberOfPieces && 'numberOfPieces' in item && item.numberOfPieces;
  // consoleDebug(`use item.numberOfPieces: ${!!useItemPieces}`);
  // if (useItemPieces) {
  //   numberOfPieces = item.numberOfPieces;
  //   consoleDebug(`numberOfPieces: ${numberOfPieces}`);
  // }

  numberOfPieces = formatInteger(numberOfPieces);
  if (numberOfPieces && numberOfPieces > 1) {
    numberOfPieces = `${numberOfPieces} pièces`;
  } else if (numberOfPieces && numberOfPieces === 1) {
    numberOfPieces = `${numberOfPieces} pièce`;
  }

  consoleDebug(`return formatted numberOfPieces: ${numberOfPieces}`);
  return numberOfPieces;
}

module.exports = extractNumberOfPieces;
