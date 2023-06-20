const consoleLog = require('../consoleLog');
const { formatAge } = require('../format/formatGeneralData');

const consoleDebug = consoleLog.debug('age');

function checkAge(text) {
  let extractedAge = null;
  let ageNumber = null;
  let age = null;
  let regex;

  const includesPlus = (
    text.includes('mois et plus')
    || text.includes('mois plus')
    || text.includes('months and older')
    || text.includes('months older')
    || text.includes('months and more')
    || text.includes('months more')
    || text.includes('months and up')
    || text.includes('months up')
    || text.includes('mois et +')
    || text.includes('mois +')
    || text.includes('months and +')
    || text.includes('months +')
    || text.includes('ans et plus')
    || text.includes('ans plus')
    || text.includes('years and older')
    || text.includes('years older')
    || text.includes('years and more')
    || text.includes('years more')
    || text.includes('years and up')
    || text.includes('years up')
    || text.includes('ans et +')
    || text.includes('ans +')
    || text.includes('years and +')
    || text.includes('years +')
    || text.includes('dès')
    || text.includes('à partir de')
    || text.includes('from')
    || text.includes('plus de')
    || text.includes('more than')
  );

  // Extract 'X à Y'
  if (!age) {
    regex = /(\d+)\s*(à|to)\s*(\d+)\s*(mois|month|ans|year)/i;
    extractedAge = text.match(regex);
    consoleDebug(`extractedAge from 'X à Y': ${extractedAge}`);

    if (extractedAge) {
      age = `${extractedAge[1]}-${extractedAge[3]} ${extractedAge[4]}`;
      consoleDebug(`age from 'X à Y': ${age}`);
    }
  }

  // Search age before text
  if (!age) {
    regex = /\d+(?:\s*[+-]\s*\d+)*\s*[+-]?(?=\s*(mois|month|ans|year))/i;
    extractedAge = text.match(regex);
    consoleDebug(`extractedAge before text': ${extractedAge}`);
    ageNumber = extractedAge && extractedAge.length >= 2 ? extractedAge[0] : null;

    if (ageNumber) {
      consoleDebug(`ageNumber: ${ageNumber}`);
      age = ageNumber.replace(/\s/g, '');

      if (ageNumber && !ageNumber.includes('+') && includesPlus) {
        consoleDebug(`with +: ${includesPlus}`);
        age += '+';
      }

      age += ` ${extractedAge[1] || 'ans'}`;
      consoleDebug(`age before text: ${age}`);
    }
  }

  // Search age after text
  if (!age) {
    regex = /[aâ]ges?d?:?\s*:?\s*(\d+\s*[+-]?)(?:\s*(?:mois|month|ans|year)\s*)?/i;
    extractedAge = text.match(regex);
    consoleDebug(`extractedAge after text': ${extractedAge}`);
    ageNumber = extractedAge && extractedAge.length >= 2 ? extractedAge[1] : null;

    if (ageNumber) {
      consoleDebug(`ageNumber: ${ageNumber}`);
      age = ageNumber.replace(/\s/g, '');

      if (ageNumber && !ageNumber.includes('+') && includesPlus) {
        consoleDebug(`with +: ${includesPlus}`);
        age += '+';
      }

      age += ` ${extractedAge[2] || 'ans'}`;
      consoleDebug(`age after text: ${age}`);
    }
  }

  return age;
}

function extractAge(item) {
  let age = null;
  const title = 'title' in item && typeof item.title === 'string'
    ? item.title.toLowerCase() : '';
  const description = 'description' in item && typeof item.description === 'string'
    ? item.description.toLowerCase() : '';

  const separateDesc = description.split('/---/');

  consoleLog.dev('extract age...');
  consoleDebug(`title: ${title}`);
  consoleDebug(`description: ${description}`);

  if (!age) {
    consoleDebug('search in the title...');
    age = checkAge(title);
  }

  if (!age) {
    consoleDebug('search in all descriptions...');
    separateDesc.forEach((desc) => {
      if (!age) {
        consoleDebug(`desc: ${desc}`);
        age = checkAge(desc);
      }
    });
  }

  const useItemAge = !age && 'age' in item && item.age;
  consoleDebug(`use item.age: ${!!useItemAge}`);
  if (useItemAge) {
    age = item.age;
    consoleDebug(`age: ${age}`);
  }

  age = formatAge(age);
  consoleDebug(`return formatted age: ${age}`);
  return age;
}

module.exports = extractAge;
