const fs = require('fs');
const zlib = require('zlib');
const Promise = require('bluebird');

const fileAccess = Promise.promisify(fs.access);
const writeFile = Promise.promisify(fs.writeFile);

const { fromReadable, fromWritable } = require('./rx-utils');

function serialize({ id, ok, timestamp, type }) {
  return `${id};${timestamp};${type};${ok}`;
}

function deserialize(str) {
  const [id, timestamp, type, ok] = str.split(';');
  return { id, timestamp: Number(timestamp), type, ok: Boolean(ok) };
}

function saveLogsToFile(observable, fileName) {
  return new Promise((resolve, reject) => {
    const gzip = zlib.createGzip();
    gzip.pipe(fs.createWriteStream(fileName));
    const observer = fromWritable(gzip, serialize);
    observer.on('complete', () => resolve(fileName));
    observer.on('error', reject);
    observable.subscribe(observer);
  });
}

function readLogsFromFile(fileName) {
  const fileReadStream = fs.createReadStream(fileName);
  const gunzip = fileReadStream.pipe(zlib.createGunzip());

  fileReadStream.on('error', (error) => {
    gunzip.end();
    console.error(`[readFromFile] ${error.message}`);
  });

  return fromReadable(gunzip, deserialize);
}

function checkFileExists(fileName) {
  return fileAccess(fileName, fs.constants.R_OK)
    .then(() => true)
    .catch((err) => {
      if (err.code === 'ENOENT') return false;
      throw err;
    });
}

function saveResults(fileName, results) {
  console.log(`Saving results to ${fileName}`);
  const strResults = results.map(([id, rank]) => `${id}:${rank}`).join('\n');
  return writeFile(fileName, strResults, 'utf8');
}

module.exports = {
  saveLogsToFile,
  readLogsFromFile,
  checkFileExists,
  saveResults,
};
