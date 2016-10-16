var through = require('through2');

/**
 * Creates a new stream with all elements that pass the test implemented by the
 * provided function.
 *
 * Applies the function `condition` to each item in the stream. The `condition`
 * is called with two arguments:
 * - The stream `item` and
 * - A `callback`.
 * If the `condition` passes an error to its `callback`, the stream emits an "error" event.
 *
 * @static
 * @memberOf nodeStream
 * @since    1.0.0
 * @category Modifiers
 *
 * @param    {Function} condition - Function that filters elements on the stream. The
 *                                  function is passed a `callback(err, keep)` which
 *                                  must be called once it's completed.
 * @returns  {Stream}             - Transform stream.
 *
 * @example
 *
 * // remove random chunks of data because data loss is fun
 * fs.createReadStream('example.txt')
 *   .pipe(nodeStream.filter((value, next) => {
 *     const rnd = Math.random() > 0.6;
 *     next(null, rnd);
 *   }))
 *   // => please don't ever do this
 *
 *
 * // return a filtered object stream
 * objStream
 *   .pipe(nodeStream.filter((value, next) => {
 *
 *     if (value.author === 'stezu') {
 *       return next(null, true);
 *     }
 *
 *     if (typeof value.author === 'undefined') {
 *       return next(new Error('unknown data')); // emit an error on the stream
 *     }
 *
 *     return next(null, false);
 *   }));
 */
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
