var stream = require('stream');

function getReadableStream(data, options) {
  var readableStream = new stream.Duplex(options);

  readableStream._read = (function() {
    var d = data.slice();

    return function() {
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
