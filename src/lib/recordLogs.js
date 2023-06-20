const fs = require('fs');
const path = require('path');

let logStream;

const folder = 'error_logs';
const filesToKeep = ['error logs here', 'console.txt'];
const consoleTxtPath = 'error_logs/console.txt';

function startRecordLogs() {
  // Empty folder
  fs.readdir(folder, (error, files) => {
    if (error) {
      console.error(`An error occurred while reading ${folder}:`, error);
      return;
    }

    const deleteFiles = files.filter((file) => !filesToKeep.includes(file));

    deleteFiles.forEach((file) => {
      const filePath = path.join(folder, file);

      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error(`An error occurred while deleting ${file}:`, err);
      }
    });
  });

  // Start recording
  try {
    fs.writeFileSync(consoleTxtPath, '');
  } catch (err) {
    console.error(`An error occurred while creating ${consoleTxtPath}:`, err);
    return;
  }

  logStream = fs.createWriteStream(consoleTxtPath);

  const originalConsoleLog = console.log;
  console.log = (...args) => {
    originalConsoleLog(...args);
    logStream.write(`${args.join(' ')}\n`);
  };
}

function stopRecordLogs() {
  logStream.end();
}

module.exports = {
  startRecordLogs,
  stopRecordLogs,
};
