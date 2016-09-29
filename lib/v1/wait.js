
function waitObj(stream, onEnd) {
  var data = [];

  function end(err) {

    if (err) {
      onEnd(err);

      return;
    }

    onEnd(null, data);
  }

  stream.on('data', function (chunk) {
    data.push(chunk);
  });
  stream.on('error', end);
  stream.on('end', end);
}

function wait(stream, onEnd) {

  waitObj(stream, function (err, data) {

    if (err) {
      onEnd(err);

      return;
    }

    onEnd(null, Buffer.concat(data.map(function (item) {
      return new Buffer(item);
    })));
  });
}

function waitJson(stream, onEnd) {

  wait(stream, function (err, data) {
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

wait.obj = waitObj;
wait.json = waitJson;

module.exports = wait;
