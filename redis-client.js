const Promise = require('bluebird');
const Redis = require('ioredis');
const logger = require('winston');
const _ = require('lodash');

Promise.promisifyAll(Redis.Cluster.prototype);

function retryStrategy(options) {
  return Math.min(options.attempt * 200, 10000);
}

const { SERVICE_TIMEOUT, CONFIG_REDIS } = require('./config');

function removePrefix(prefix, values) {
  const pattern = new RegExp(`${prefix}(.+)$`);
  return values.map(value => pattern.exec(value)[1]);
}

module.exports = function (keyPrefix, config = CONFIG_REDIS) {
  const client = new Redis(config.urls, Object.assign({}, { retryStrategy }, config.options));

  client.on('error', err => logger.error(`Redis client error: ${err.message}`, err));

  return {
    setValueEx(key, value, ttl) {
      return client
        .set(`${keyPrefix}${key}`, JSON.stringify(value), 'EX', ttl)
        .timeout(SERVICE_TIMEOUT, `[Redis] Timeout Setting Value for Key ${keyPrefix}${key}`);
    },
    setValue(key, value) {
      return client
        .set(`${keyPrefix}${key}`, JSON.stringify(value))
        .timeout(SERVICE_TIMEOUT, `[Redis] Timeout Setting Value for Key ${keyPrefix}${key}`);
    },
    getValue(key) {
      return client
        .get(`${keyPrefix}${key}`)
        .timeout(SERVICE_TIMEOUT, `[Redis] Timeout Getting Value for Key ${keyPrefix}${key}`)
        .then(JSON.parse);
    },
    getValues() {
      return client
        .keys(`${keyPrefix}*`)
        .then((keys) => {
          return client.mget(...keys)
            .then(values => _.zipObject(removePrefix(keyPrefix, keys), values.map(JSON.parse)));
        });
    },
  };
};
