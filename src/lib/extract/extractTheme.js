const consoleLog = require('../consoleLog');
const themeList = require('../lists/themeList');

function extractTheme(item) {
  const consoleDebug = consoleLog.debug('theme');
  let theme = null;
  const title = 'title' in item && typeof item.title === 'string'
    ? item.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/chevalet/g, '') : '';
  const description = 'description' in item && typeof item.description === 'string'
    ? item.description
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/chevalet/g, '') : '';

  consoleLog.dev('extract theme...');
  consoleDebug(`title: ${title}`);
  consoleDebug(`description: ${description}`);

  themeList.slice().reverse().forEach((themeGroup) => {
    const { keywords } = themeGroup;
    keywords.forEach((keyword) => {
      const normalizedWord = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      if (title.includes(normalizedWord)) {
        theme = themeGroup.name;
        consoleDebug(`keyword found: ${keyword}`);
        consoleDebug(`theme found: ${themeGroup.name}`);
      }
    });
  });
  consoleDebug(`theme: ${theme}`);

  const useItemTheme = !theme && 'theme' in item && item.theme;
  consoleDebug(`use item.theme: ${!!useItemTheme}`);
  if (useItemTheme) {
    theme = item.theme;
    consoleDebug(`theme: ${theme}`);
  }

  consoleDebug(`return theme: ${theme}`);
  return theme;
}

module.exports = extractTheme;
