//const consul = require('consul')({ host: process.env.CONSUL_HOST || 'localhost', promisify: true });

const numDays = 5;
const maxPerBucket = 5;
const maxFrequency = 10;
const successRate = 0.7;
const numIdsPerRun = 500;
const dataDir = process.env.NODE_ENV === 'prod' ? '/usr/app/data/' : './data/';
// const NUM_DAYS = 5;

module.exports = {
  get NUM_DAYS() {
    return numDays;
  },
  get MAX_PER_BUCKET() {
    return maxPerBucket;
  },
  get MAX_FREQUENCY() {
    return maxFrequency;
  },
  get SUCCESS_RATE() {
    return successRate;
  },
  get NUM_IDS_PER_RUN() {
    return numIdsPerRun;
  },
  get DATA_DIR() {
    return dataDir;
  },
  onConfigLoad() {

  },
};
