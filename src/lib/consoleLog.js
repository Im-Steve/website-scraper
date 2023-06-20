const consoleColors = require('./consoleColors');

function dev(text) {
  let isDevLevel = false;

  process.argv.forEach((argv) => {
    if (argv === 'dev' || argv === 'debug' || argv === 'debug-all') {
      isDevLevel = true;
    }
  });

  if (isDevLevel) {
    console.log(consoleColors.dev, text);
  }
}

function debug(text, module) {
  let isDebugLevel = false;
  let isModuleLevel = false;

  process.argv.forEach((argv) => {
    if (argv === 'debug') {
      isDebugLevel = true;
    }
    if (argv === 'debug-all') {
      isDebugLevel = true;
      isModuleLevel = true;
    }
    if (argv === 'debug' && !module) {
      isDebugLevel = true;
      isModuleLevel = true;
    }
    if (argv === module) {
      isModuleLevel = true;
    }
  });

  if (isDebugLevel && isModuleLevel) {
    console.log(consoleColors.debug, text);
  }
}

function error(text) {
  let isErrorLevel = false;

  process.argv.forEach((argv) => {
    if (argv === 'dev' || argv === 'debug' || argv === 'debug-all') {
      isErrorLevel = true;
    }
  });

  if (isErrorLevel) {
    console.log(consoleColors.error2, text);
  }
}

const consoleLog = {
  dev,
  debug: (module) => ((text) => { debug(text, module); }),
  error,
};

module.exports = consoleLog;
