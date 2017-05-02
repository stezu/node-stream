var _ = require('lodash');

var map = require('./map.js');

/**
 * Creates a new Stream without the first `n` values from the source stream.
 *
 * @static
 * @since    1.4.0
 * @category Modifiers
 *
 * @param   {Number} n         - Number of items to drop from the source stream.
 * @returns {Stream.Transform} - Transform stream.
 *
 * @example
 *
 * // drop the first 3 items from a stream
 * inStream // => ['b', 'a', 'n', 'a', 'n', 'a']
 *   .pipe(nodeStream.drop(3))
 *   .pipe(process.stdout)
 *   // => ['a', 'n', 'a']
 */
function drop(n) {
  var idx = 0;

  return map(function (chunk, next) {
    idx += 1;

    if (!_.isInteger(n)) {
      return next(new TypeError('Expected `n` to be an integer.'));
    }

    // drop n items from the source stream
    if (idx <= n) {
      return next();
    }

    // take all other items
    return next(null, chunk);
  });
}

module.exports = drop;
