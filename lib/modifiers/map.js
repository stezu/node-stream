var through = require('through2');

function map(transform) {

  return through.obj(function (chunk, enc, next) {
    transform(chunk, next);
  });
}

module.exports = map;
