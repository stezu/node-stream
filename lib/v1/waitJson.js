var wait = require('./wait.js');

function waitJson(stream, onEnd) {

  wait(stream, function(err, data) {
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

module.exports = waitJson;
