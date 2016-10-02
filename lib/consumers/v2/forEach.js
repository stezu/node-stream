var through = require('through2');

function forEachObj(onData, onEnd) {

  var stream = through.obj(function (chunk, enc, next) {
    onData(chunk);
    next(null, chunk);
  });

  stream.on('error', onEnd);
  stream.on('end', onEnd);

  return stream;
}

function forEach(onData, onEnd) {

  var stream = through.obj(function (chunk, enc, next) {
    onData(new Buffer(chunk));
    next(null, chunk);
  });

  stream.on('error', onEnd);
  stream.on('end', onEnd);

  return stream;
}

function forEachJson(onData, onEnd) {

  var stream = through.obj(function (chunk, enc, next) {
    var parsed;

    try {
      parsed = JSON.parse(chunk);
    } catch (e) {
      next(e);

      return;
    }

    onData(parsed);

    next(null, chunk);
  });

  stream.on('error', onEnd);
  stream.on('end', onEnd);

  return stream;
}

forEach.obj = forEachObj;
forEach.json = forEachJson;

module.exports = forEach;
