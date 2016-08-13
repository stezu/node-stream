var forEach = require('./forEach.js');

function forEachJson(stream, onData, onEnd) {

  forEach(stream, function(chunk) {
    var parsed;

    try {
      parsed = JSON.parse(chunk);
    } catch (e) {
      stream.emit('error', e);

      return;
    }

    onData(parsed);
  }, onEnd);
}

module.exports = forEachJson;
