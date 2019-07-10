const stream = require('stream');

function getReadableStream(data, options) {
  const readableStream = new stream.Readable(options);

  readableStream._read = (() => { // eslint-disable-line no-underscore-dangle
    const d = data.slice();

    return function Read() {
      if (d.length > 0) {
        this.push(d.shift());
      } else {
        this.push(null);
      }
    };
  })();

  return readableStream;
}

module.exports = getReadableStream;
