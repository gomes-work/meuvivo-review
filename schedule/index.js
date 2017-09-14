const { ZonedDateTime, LocalDate } = require('js-joda');
const _ = require('lodash');

const { saveResults } = require('./file-handling');
const classify = require('./classifier');
const {
  checkAndDownloadRequiredFiles,
  readDataFromRange,
  turnOnReviewsIfNeeded,
} = require('./service');

const { onConfigLoad } = require('./config');

onConfigLoad(({ DATA_DIR, NUM_DAYS, NUM_IDS_PER_RUN }) => {
  let lDate = ZonedDateTime.now().toLocalDate().minusDays(1);
  if (process.env.LOCAL_DATE) {
    lDate = LocalDate.parse(process.env.LOCAL_DATE);
  }

  const date = lDate;
  const dateRange = _.rangeRight(NUM_DAYS).map(date.minusDays, date);
  const resultsFileName = `${DATA_DIR}results-${date.toString()}.txt`;

  checkAndDownloadRequiredFiles(dateRange)
    .then(() => classify(readDataFromRange(dateRange), NUM_IDS_PER_RUN))
    .tap(results => saveResults(resultsFileName, results))
    .then(results => turnOnReviewsIfNeeded(results.map(([id]) => id)))
    .then(() => { console.log('Done.'); process.exit(); })
    .catch(console.error);
});

