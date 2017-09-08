const Rx = require('rxjs');
const EventEmitter = require('events');

const isProduction = process.env.NODE_ENV === 'prod';

const REPORT_COUNT = isProduction ? 100000 : 1000;
const RUN_EXPIRED_CHECK_INTERVAL = isProduction ? 30 : 1;

const differenceInMinutes = (a, b) => (a - b) / 60000;

class MatcherState extends EventEmitter {
  constructor() {
    super();
    this._count = 0;
    this._lastseen = null;
  }

  seen(data) {
    this._lastseen = data;
    this._count += 1;
    this.checkNotifyRemoveExpired();
  }

  checkNotifyRemoveExpired() {
    const timestamp = this._lastseen.timestamp;
    if (this.mustCheckForExpired()) {
      this.emit('removeExpired', this._lastRemoveExpiredRun);
      this._lastRemoveExpiredRun = timestamp;
    }
  }

  mustCheckForExpired() {
    const timestamp = this._lastseen.timestamp;
    const lastCheck = this._lastRemoveExpiredRun || (this._lastRemoveExpiredRun = timestamp);
    return differenceInMinutes(timestamp, lastCheck) > RUN_EXPIRED_CHECK_INTERVAL;
  }

  get count() {
    return this._count;
  }
  get lastseen() {
    return this._lastseen;
  }
}

function loginEntryMatcher(logDataStream, observer) {
  const sessionMap = new Map();
  const state = new MatcherState();

  function sendOk(key, { type, timestamp }) {
    observer.next({ id: key, type, timestamp, ok: true });
  }

  function sendNOk(key, { type, timestamp }) {
    observer.next({ id: key, type, timestamp, ok: false });
  }

  function removeExpired(referenceTimestamp) {
    sessionMap.forEach((value, key) => {
      if (differenceInMinutes(referenceTimestamp, value.timestamp) > 2) {
        sessionMap.delete(key);
        sendNOk(key, value);
      }
    });
  }

  function onComplete() {
    removeExpired(state.lastseen.timestamp);
    observer.complete();
  }

  function onError(error) {
    observer.error(error);
  }

  function process(data) {
    const { timestamp, type, installId } = data;

    if (type !== 'home') {
      if (sessionMap.has(installId)) {
        sendNOk(installId, sessionMap.get(installId));
      }
      sessionMap.set(installId, { type, timestamp });
    } else if (sessionMap.has(installId)) {
      sendOk(installId, sessionMap.get(installId));
      sessionMap.delete(installId);
    }

    if (state.count % REPORT_COUNT === 0) {
      console.log(`Processed: ${state.count}`);
    }
  }

  function onData(data) {
    state.seen(data);
    process(data);
  }

  state.on('removeExpired', removeExpired);
  logDataStream.subscribe(onData, onError, onComplete);
}

function createLoginStream(logDataStream) {
  return Rx.Observable.create(observer => loginEntryMatcher(logDataStream, observer));
}

module.exports = {
  createLoginStream,
};
