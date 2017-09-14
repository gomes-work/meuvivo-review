const consul = require('consul')({ host: process.env.CONSUL_HOST || 'localhost', promisify: true });

let numDays = 5;
let maxPerBucket = 5;
let maxFrequency = 10;
let successRate = 0.7;
let numIdsPerRun = 500;

const dataDir = process.env.NODE_ENV === 'prod' ? '/data/' : './data/';

const configs = {
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
};

function onConfigLoad(fun) {
  consul.kv.get('configuration/review')
    .then((result) => {
      const data = JSON.parse(result.Value);
      numDays = data.numDays;
      maxPerBucket = data.maxPerBucket;
      maxFrequency = data.maxFrequency;
      successRate = data.successRate;
      numIdsPerRun = data.numIdsPerRun;

      fun(configs);
    })
    .catch(err => console.log(`[Consul] Config error: ${err.message}`, err));
}

// const NUM_DAYS = 5;

module.exports = {
  configs,
  onConfigLoad,
};
