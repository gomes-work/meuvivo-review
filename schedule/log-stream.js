const { ZonedDateTime, ChronoUnit, ZoneId } = require('js-joda');
const _ = require('lodash');

const findElasticDocuments = require('./elastic');

const DEFAULT_ZONE = ZoneId.of('GMT-3');
const URL_PATTERN = /Request on \/login\/auth\/([^ ]+) Received|Request on \/menu\/([^ ]+) Finished with status 302/;

const extractRequestType = (message) => {
  const res = URL_PATTERN.exec(message);
  return res[1] || res[2];
};

const filterChain = (data) => {
  const filter = !!data.installId;
  if (!filter) console.error(`[Log Stream] Missing InstallId on Data ${data}`);
  return filter;
};

const parseTimestamp = str => ZonedDateTime.parse(str).withZoneSameInstant(DEFAULT_ZONE);
const toEpochMilli = zoneDateTime => zoneDateTime.toInstant().toEpochMilli();

const extractData = ({ _source }) => ({
  timestamp: toEpochMilli(parseTimestamp(_source['@timestamp'])),
  type: extractRequestType(_source.message),
  installId: _source.fields.installId,
  appVersion: _.get(_source, 'fields.useragent.appVersion'),
});


module.exports = function createLogStream({ start, end }) {
  return findElasticDocuments(toEpochMilli(start), toEpochMilli(end))
    .map(extractData)
    .filter(filterChain);
};
