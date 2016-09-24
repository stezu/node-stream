var stream = require('stream');

function getDuplexStream(data, options) {
  var duplexStream = new stream.Duplex(options);

  duplexStream._read = (function() {
    var d = data.slice();

    return function() {
      if (d.length > 0) {
        this.push(d.shift());
      } else {
        this.push(null);
      }
    };
  }());

  return duplexStream;
}

module.exports = getDuplexStream;
