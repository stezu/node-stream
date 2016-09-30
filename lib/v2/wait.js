var through = require('through2');

function waitObj(onEnd) {
  var data = [];

  var stream = through.obj(function (chunk, enc, next) {
    data.push(chunk);
    next(null, chunk);
  });

  stream.on('error', onEnd);
  stream.on('end', function () {
    onEnd(null, data);
  });

  return stream;
}

function wait(onEnd) {
  var data = [];

  var stream = through.obj(function (chunk, enc, next) {
    data.push(chunk);
    next(null, chunk);
  });

  stream.on('error', onEnd);
  stream.on('end', function () {
    var buff = Buffer.concat(data.map(function (item) {
      return new Buffer(item);
    }));

    onEnd(null, buff);
  });

  return stream;
}

function waitJson(onEnd) {
  var data = [];

  var stream = through.obj(function (chunk, enc, next) {
    data.push(chunk);
    next(null, chunk);
  });

  stream.on('error', onEnd);
  stream.on('end', function () {
    var buff = Buffer.concat(data.map(function (item) {
      return new Buffer(item);
    }));
    var parsed;

    try {
      parsed = JSON.parse(buff);
    } catch (e) {
      onEnd(e);

      return;
    }

    onEnd(null, parsed);
  });

  return stream;
}

wait.obj = waitObj;
wait.json = waitJson;

module.exports = wait;
