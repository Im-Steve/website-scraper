function formatBuroproText(text) {
  return (typeof text !== 'string' ? text
    : text
      .replace(/\n/g, ' ')
      .replace(/1\/2/g, '½')
      .replace(/%3cp%3e/g, '')
      .replace(/%3c\/p%3e/g, '')
      .replace(/%3cbr%3e/g, '')
      .replace(/%26eacute%3b/g, 'é')
      .replace(/%26Eacute%3b/g, 'É')
      .replace(/%26egrave%3b/g, 'è')
      .replace(/%26Egrave%3b/g, 'È')
      .replace(/%26ecirc%3b/g, 'ê')
      .replace(/%26Ecirc%3b/g, 'Ê')
      .replace(/%26agrave%3b/g, 'à')
      .replace(/%26Agrave%3b/g, 'À')
      .replace(/%26acirc%3b/g, 'â')
      .replace(/%26Acirc%3b/g, 'Â')
      .replace(/%26ccedil%3b/g, 'ç')
      .replace(/%26Ccedil%3b/g, '`Ç')
      .replace(/%26rsquo%3b/g, '’')
      .replace(/%26laquo%3b/g, '«')
      .replace(/%26raquo%3b/g, '»')
      .replace(/%21/g, '!')
      .replace(/%22/g, '"')
      .replace(/%23/g, '#')
      .replace(/%26/g, '&')
      .replace(/%27/g, "'")
      .replace(/%28/g, '(')
      .replace(/%29/g, ')')
      .replace(/%2b/g, '+')
      .replace(/%2c/g, ',')
      .replace(/%3a/g, ':')
      .replace(/%3b/g, ';')
      .replace(/%3f/g, '?')
      .replace(/%7b/g, '{')
      .replace(/%3cem%3e/g, '')
      .replace(/\r?\n|\r/g, ' ')
  );
}

function formatPrimaryData(item) {
  return {
    internalCode: Object.values(item)[0].toString(),
  };
}

module.exports = {
  formatBuroproText,
  formatPrimaryData,
};
