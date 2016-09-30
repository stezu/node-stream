var through = require('through2');

function firstObj(onEnd) {
  var data;

  var stream = through.obj(function (chunk, enc, next) {
    if (!data) {
      data = chunk;
    }

    next(null, chunk);
  });

  stream.on('error', onEnd);
  stream.on('end', function () {
    onEnd(null, data);
  });

  return stream;
}

function first(onEnd) {
  var data;

  var stream = through.obj(function (chunk, enc, next) {
    if (!data) {
      data = chunk;
    }

    next(null, chunk);
  });

  stream.on('error', onEnd);
  stream.on('end', function () {
    onEnd(null, new Buffer(data));
  });

  return stream;
}

function firstJson(onEnd) {
  var data;

  var stream = through.obj(function (chunk, enc, next) {
    if (!data) {
      data = chunk;
    }

    next(null, chunk);
  });

  stream.on('error', onEnd);
  stream.on('end', function () {
    var parsed;

    try {
      parsed = JSON.parse(data);
    } catch (e) {
      onEnd(e);

      return;
    }

    onEnd(null, parsed);
  });

  return stream;
}

first.obj = firstObj;
first.json = firstJson;

module.exports = first;
