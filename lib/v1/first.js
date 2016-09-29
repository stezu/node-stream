
function firstObj(stream, onEnd) {
  var data;

  function end(err) {

    if (err) {
      onEnd(err);

      return;
    }

    onEnd(null, data);
  }

  stream.once('data', function (chunk) {
    data = chunk;
  });
  stream.on('error', end);
  stream.on('end', end);
}

function first(stream, onEnd) {

  firstObj(stream, function (err, data) {

    if (err) {
      onEnd(err);

      return;
    }

    onEnd(null, new Buffer(data));
  });
}

function firstJson(stream, onEnd) {

  first(stream, function (err, data) {
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

first.obj = firstObj;
first.json = firstJson;

module.exports = first;
