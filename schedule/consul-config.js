const EventEmitter = require('events');
const consul = require('consul')({ host: process.env.CONSUL_HOST || 'localhost', promisify: true });

const logError = (error) => {
  console.error(`[Configuration] ${error.message}`, error);
};

module.exports = function (key) {
  const events = new EventEmitter();
  const watch = consul.watch({ method: consul.kv.get, options: { key } });

  watch.on('change', (changed = {}) => {
    console.info(`[Configuration] Configuration Changed Event on Key ${key}: ${changed.Value}`);
    Promise.resolve(changed.Value)
      .then(value => events.emit('change', JSON.parse(value)))
      .catch(logError);
  });

  watch.on('error', logError);

  return {
    onConfigChange(fn) {
      events.on('change', fn);
    },
  };
};
