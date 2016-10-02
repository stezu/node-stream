
function forEachObj(stream, onData, onEnd) {
  stream.on('data', onData);
  stream.on('error', onEnd);
  stream.on('end', onEnd);
}

function forEach(stream, onData, onEnd) {

  forEachObj(stream, function (chunk) {
    onData(new Buffer(chunk));
  }, onEnd);
}

function forEachJson(stream, onData, onEnd) {

  forEach(stream, function (chunk) {
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

forEach.obj = forEachObj;
forEach.json = forEachJson;

module.exports = forEach;
