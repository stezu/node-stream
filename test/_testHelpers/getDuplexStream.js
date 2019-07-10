const stream = require('stream');

function getDuplexStream(data, options) {
  const duplexStream = new stream.Duplex(options);

  duplexStream._read = (() => { // eslint-disable-line no-underscore-dangle
    const d = data.slice();

    return function Read() {
      if (d.length > 0) {
        this.push(d.shift());
      } else {
        this.push(null);
      }
    };
  })();

  return duplexStream;
}

module.exports = getDuplexStream;
