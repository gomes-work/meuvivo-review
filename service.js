const redis = require('./redis-client.js')(':review:request:');
const Promise = require('bluebird');
const _ = require('lodash');

function updateReview(value, aparelhos) {
  return Promise.all(aparelhos.map(aparelho => redis.setValue(aparelho, value)));
}

const turnOn = aparelhos => updateReview('true', aparelhos);
const turnOff = aparelhos => updateReview('false', aparelhos);

module.exports = {
  turnOnReview(aparelhos) {
    return Promise.mapSeries(_.chunk(aparelhos, 5), turnOn);
  },
  turnOffReview(aparelhos) {
    return Promise.mapSeries(_.chunk(aparelhos, 5), turnOff);
  },
  getReviews() {
    return redis.getValues();
  },
};
