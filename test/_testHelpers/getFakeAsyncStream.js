const stream = require('stream');

const sinon = require('sinon');

function asyncStream(Constructor, data, options) {
  const instance = new Constructor(options);
  const dataCopy = data.slice();
  const clock = sinon.useFakeTimers(Date.now());

  instance._read = function Read() { // eslint-disable-line no-underscore-dangle
    clock.tick(1);

    if (dataCopy.length > 0) {
      this.push(dataCopy.shift());
    } else {
      clock.restore();
      this.push(null);
    }
  };

  return instance;
}

function asyncReadableStream(data, options) {
  return asyncStream(stream.Readable, data, options);
}

function asyncDuplexStream(data, options) {
  return asyncStream(stream.Duplex, data, options);
}

module.exports = {
  readable: asyncReadableStream,
  duplex: asyncDuplexStream
};
