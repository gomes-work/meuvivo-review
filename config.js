const { SERVICE_TIMEOUT = 2000, NODE_ENV = 'dev' } = process.env;
const CONFIG_REDIS_DEV = {
  urls: {
    host: 'redis',
    port: 6379,
  },
  options: {
    scaleReads: 'all',
  },
};

const CONFIG_REDIS_PROD = {
  urls: {
    sentinels: [
      {
        host: 'redis.service.consul',
        port: 26379,
      },
    ],
    name: 'redis-cluster',
  },
  options: {
    scaleReads: 'all',
  },
};

const CONFIG_REDIS = (NODE_ENV === 'dev') ? CONFIG_REDIS_DEV : CONFIG_REDIS_PROD;

module.exports = {
  NODE_ENV,
  CONFIG_REDIS,
  SERVICE_TIMEOUT,
};
