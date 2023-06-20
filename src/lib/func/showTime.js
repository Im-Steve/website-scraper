const consoleColors = require('../consoleColors');

function showDate(date) {
  console.log(consoleColors.date, date.toLocaleString('fr-CA', { timeZone: 'America/Toronto' }));
}

function showElapsedTime(startTime) {
  const endTime = new Date();
  showDate(endTime);
  const elapsedTimeInSeconds = (endTime - startTime) / 1000;
  const elapsedTimeInMinutes = elapsedTimeInSeconds / 60;
  console.log('time elapsed:', elapsedTimeInMinutes.toFixed(2), 'min');
}

module.exports = {
  showDate,
  showElapsedTime,
};
