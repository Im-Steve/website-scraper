function formatGeneralData(data) {
  return (typeof data !== 'string' ? data
    : data
      .replace(/,/g, ', ')
      .replace(/\//g, ', ')
      .replace(/\s{2,}/g, ' ')
      .replace(/\./g, '')
      .replace(/‎/g, '')
      .toLowerCase()
  );
}

function formatAge(age) {
  if (typeof age !== 'string') {
    return age;
  }

  age = age.toLowerCase();
  age = age.replace(/\s/g, '').replace(/‎/g, '');

  const regex = /[\d+-]+/g;
  const matches = age.match(regex);
  let result = matches ? matches.join('') : '';

  if (age.includes('an') || age.includes('year')) {
    result += ' ans';
  } else if (age.includes('mois') || age.includes('month')) {
    result += ' mois';
  } else {
    result += ' ans';
  }

  return result;
}

module.exports = {
  formatAge,
  formatGeneralData,
};
