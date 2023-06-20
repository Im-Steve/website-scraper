function formatFloat(number) {
  if (typeof number === 'string') {
    number = number.replace(/‎/g, '');
  }

  return !Number.isNaN(parseFloat(number))
    ? parseFloat(number).toFixed(2).toString().replace(/\.*0+$/, '')
    : number;
}

function formatInteger(number) {
  if (typeof number === 'string') {
    number = number.replace(/‎/g, '');
  }

  return !Number.isNaN(parseInt(number, 10))
    ? parseInt(number, 10)
    : number;
}

function formatUnitOfMeasure(unitOfMeasure) {
  return (typeof unitOfMeasure !== 'string' ? unitOfMeasure
    : unitOfMeasure
      .replace(/‎/g, '')
      .replace(/millimètres/g, 'mm')
      .replace(/millimètre/g, 'mm')
      .replace(/millimetres/g, 'mm')
      .replace(/millimetre/g, 'mm')
      .replace(/millimeters/g, 'mm')
      .replace(/millimeter/g, 'mm')
      .replace(/centimètres/g, 'cm')
      .replace(/centimètre/g, 'cm')
      .replace(/centimetres/g, 'cm')
      .replace(/centimetre/g, 'cm')
      .replace(/centimeters/g, 'cm')
      .replace(/centimeter/g, 'cm')
      .replace(/''/g, '"')
      .replace(/pouces/g, '"')
      .replace(/pouce/g, '"')
      .replace(/inches/g, '"')
      .replace(/inche/g, '"')
      .replace(/in/g, '"')
      .toLowerCase()
  );
}

function formatUnitOfWeight(unitOfWeight) {
  return (typeof unitOfWeight !== 'string' ? unitOfWeight
    : unitOfWeight
      .replace(/‎/g, '')
      .replace(/kilogrammes/g, 'kg')
      .replace(/kilogramme/g, 'kg')
      .replace(/kilograms/g, 'kg')
      .replace(/kilogram/g, 'kg')
      .replace(/kilo/g, 'kg')
      .replace(/grammes/g, 'g')
      .replace(/gramme/g, 'g')
      .replace(/grams/g, 'g')
      .replace(/gram/g, 'g')
      .replace(/livres/g, 'lbs')
      .replace(/livre/g, 'lb')
      .replace(/pounds/g, 'lbs')
      .replace(/pound/g, 'lb')
      .replace(/onces/g, 'oz')
      .replace(/once/g, 'oz')
      .toLowerCase()
  );
}

function formatUnitOfQuantity(unitOfQuantity) {
  return (typeof unitOfQuantity !== 'string' ? unitOfQuantity
    : unitOfQuantity
      .replace(/‎/g, '')
      .replace(/liters/g, 'litres')
      .replace(/liter/g, 'litre')
      .replace(/millilitres/g, 'ml')
      .replace(/millilitre/g, 'ml')
      .replace(/milliliters/g, 'ml')
      .replace(/milliliter/g, 'ml')
      .toLowerCase()
  );
}

function formatPencilTip(pencilTip) {
  if (typeof pencilTip !== 'string') {
    return pencilTip;
  }

  pencilTip = pencilTip.toLowerCase();
  pencilTip = pencilTip.replace(/\s|‎/g, '').replace(/,/g, '.');

  const regex = /([.,]?\d+[.,]?\d*)/;
  const extractedTip = pencilTip.match(regex);

  if (extractedTip) {
    pencilTip = extractedTip[0].charAt(0) === '.' ? `0${extractedTip[0]} mm` : `${extractedTip[0]} mm`;
  }

  return pencilTip;
}

function formatOneMeasure(dimension) {
  if (typeof dimension !== 'string') {
    return dimension;
  }

  dimension = dimension.toLowerCase();
  dimension = dimension.replace(/\s|‎/g, '');
  dimension = formatUnitOfMeasure(dimension);
  dimension = formatUnitOfWeight(dimension);
  dimension = formatUnitOfQuantity(dimension);

  const regex = /(\d+(?:[.,]\d+)?)(\D+)/i;
  const parts = dimension.match(regex);
  if (parts && parts.length > 2) {
    dimension = `${formatFloat(parts[1])} ${parts[2]}`;
    dimension = dimension.replace(/\s"/g, '"');
    return dimension;
  }
  return dimension;
}

function formatDimensions(dimensions) {
  if (typeof dimensions !== 'string') {
    return dimensions;
  }

  dimensions = dimensions.toLowerCase();
  dimensions = dimensions.replace(/\s|‎/g, '');
  dimensions = formatUnitOfMeasure(dimensions);
  dimensions = dimensions.replace(/"|'/g, '');

  const regex = /([\d.,]+)\s*(x)?\s*([\d.,]+)?\s*(\D+)?/i;
  const dimension = dimensions.replace(regex, (match, e1, e2, e3, e4) => {
    if (e1 && e3) {
      e1 = formatInteger(e1);
      e3 = formatInteger(e3);
    }
    if (e1 && e2 && e3 && e4) {
      return `${e1}x${e3} ${e4}`;
    }
    if (e1 && e2 && e3) {
      return `${e1}x${e3}`;
    }
    return match;
  });

  return dimension;
}

module.exports = {
  formatDimensions,
  formatFloat,
  formatInteger,
  formatOneMeasure,
  formatPencilTip,
  formatUnitOfMeasure,
  formatUnitOfWeight,
};
