var firstObj = require('./firstObj.js');

function first(stream, onEnd) {

  firstObj(stream, function(err, data) {

    if (err) {
      onEnd(err);

      return;
    }

    onEnd(null, new Buffer(data));
  });
}

module.exports = first;
