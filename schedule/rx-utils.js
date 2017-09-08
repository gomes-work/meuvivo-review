const Rx = require('rxjs');
const EventEmiter = require('events');

function fromWritable(writeStream, serialize = JSON.stringify) {
  const emiter = new EventEmiter();
  writeStream.on('error', error => emiter.emit('error', error));
  return Object.assign(emiter, {
    next: data => writeStream.write(`${serialize(data)}\n`),
    error: (error) => {
      writeStream.close();
      emiter.emit('error', error);
    },
    complete: () => {
      writeStream.end();
      emiter.emit('complete');
    },
  });
}

function fromReadable(readStream, deserialize = JSON.parse) {
  readStream.pause();
  readStream.setEncoding('utf8');
  return Rx.Observable.create((observer) => {
    let rem = '';
    readStream.on('data', (data) => {
      const parts = (rem + data).split('\n');
      rem = parts.pop();
      parts.forEach(part => observer.next(deserialize(part)));
    });
    readStream.on('error', err => observer.error(err));
    readStream.on('end', () => observer.complete());
    readStream.resume();
  });
}

module.exports = {
  fromWritable,
  fromReadable,
};
