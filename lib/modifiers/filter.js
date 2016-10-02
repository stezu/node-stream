var through = require('through2');

function filter(condition) {

  return through.obj(function (chunk, enc, next) {

    condition(chunk, function (err, keep) {

      if (err) {
        return next(err);
      }

      if (keep) {
        return next(null, chunk);
      }

      return next();
    });
  });
}

module.exports = filter;
