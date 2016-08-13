var first = require('./first.js');

function firstJson(stream, onEnd) {

  first(stream, function(err, data) {
    var parsed;

    if (err) {
      onEnd(err);

      return;
    }

    try {
      parsed = JSON.parse(data);
    } catch (e) {
      onEnd(e);

      return;
    }

    onEnd(null, parsed);
  });
}

module.exports = firstJson;
