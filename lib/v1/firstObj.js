
function firstObj(stream, onEnd) {
  var data;

  function end(err) {

    if (err) {
      onEnd(err);

      return;
    }

    onEnd(null, data);
  }

  stream.once('data', function(chunk) {
    data = chunk;
  });
  stream.on('error', end);
  stream.on('end', end);
}

module.exports = firstObj;
