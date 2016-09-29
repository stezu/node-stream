var stream = require('stream');

function getReadableStream(data) {
  var readableStream = new stream.Readable();

  readableStream._read = (function () { // eslint-disable-line no-underscore-dangle
    var d = data.slice();

    return function () {
      if (d.length > 0) {
        this.push(d.shift());
      } else {
        this.push(null);
      }
    };
  }());

  return readableStream;
}

module.exports = getReadableStream;
