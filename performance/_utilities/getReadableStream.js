var stream = require('stream');

function getReadableStream(data) {
  var readableStream = new stream.Readable();

  readableStream._read = (function() {
    var d = data.slice().concat([12]);

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
