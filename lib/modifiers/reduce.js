var through = require('through2');

function reduce(reducer, initialValue) {
  var accumulator = initialValue;

  return through.obj(
    function transform(chunk, enc, next) {

      reducer(accumulator, chunk, function (err, result) {
        accumulator = result;
        next(err);
      });
    },
    function Flush(next) {
      this.push(accumulator);
      next();
    }
  );
}

module.exports = reduce;
