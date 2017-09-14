const { ZonedDateTime, LocalTime, ZoneId } = require('js-joda');
const Promise = require('bluebird');
const Rx = require('rxjs');

const redisService = require('../service');
const createLogStream = require('./log-stream');
const { createLoginStream } = require('./login-stream');
const { readLogsFromFile, saveLogsToFile, checkFileExists } = require('./file-handling');

const { configs } = require('./config');

const fileNameForDate = date => `${configs.DATA_DIR}${date.toString()}.txt.gz`;

function downloadData(date) {
  console.log(`Downloading for date: ${date.toString()}`);
  const start = ZonedDateTime.of(date, LocalTime.MIN, ZoneId.of('GMT-3'));
  const end = process.env.NODE_ENV === 'prod' ? start.plusDays(1) : start.plusMinutes(1);

  const loginStream = createLoginStream(createLogStream({ start, end }));
  return saveLogsToFile(loginStream, fileNameForDate(date));
}

function readDataFromRange(dateRange) {
  const observables = dateRange.map(dt => readLogsFromFile(fileNameForDate(dt)));
  return Rx.Observable.concat(...observables);
}

function checkAndDownloadRequiredFiles(dateRange) {
  return Promise.resolve(dateRange).mapSeries(dt =>
    checkFileExists(fileNameForDate(dt)).then((found) => {
      if (!found) return downloadData(dt);
      return false;
    }),
  );
}

async function turnOnReviewsIfNeeded(devices) {
  const foundReviews = await redisService.getReviewsForIds(devices);
  const idsToSet = devices.filter(device => foundReviews[device] === null);
  return redisService.turnOnReview(idsToSet);
}

module.exports = {
  downloadData,
  readDataFromRange,
  checkAndDownloadRequiredFiles,
  turnOnReviewsIfNeeded,
};
