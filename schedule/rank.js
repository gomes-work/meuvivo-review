const _ = require('lodash');

const { MAX_PER_BUCKET, MAX_FREQUENCY, NUM_DAYS, SUCCESS_RATE } = require('./config');

function successRate(data) {
  const rate = data.reduce((x, y) => x + y[2], 0) / data.length;
  if (rate < SUCCESS_RATE) return -Infinity;
  return (Math.exp(1 + SUCCESS_RATE * 2) - 10) / 3;
}

function frequency(data) {
  if (data.length > MAX_FREQUENCY) return -Infinity;
  return Math.log(data.length) / NUM_DAYS;
}

function perLoginType(data) {
  const sum = _.reduce(data, (acc, x) => acc + x[0], 0);
  return 3 * (sum / (10 * data.length));
}

function processBuckets(data) {
  const buckets = _.countBy(data, x => Math.floor(x[1] / 30));
  const maxBucketExceeded = _.some(buckets, count => count > MAX_PER_BUCKET);
  if (maxBucketExceeded) {
    return -Infinity;
  }

  const noDaysVizited = _.countBy(_.keys(buckets), x => Math.floor(x / 48));

  return Math.log(_.size(noDaysVizited));
}

function calculateRank(data) {
  return successRate(data) + perLoginType(data) + processBuckets(data) + frequency(data);
}
module.exports = calculateRank;
