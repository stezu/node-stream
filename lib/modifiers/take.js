var _ = require('lodash');

var map = require('./map.js');

/**
 * Creates a new Stream with the first `n` values from the source stream.
 *
 * @static
 * @since    1.4.0
 * @category Modifiers
 *
 * @param    {Number}  n        - Number of items to take from the source stream.
 * @returns  {Stream.Transform} - Transform stream.
 *
 * @example
 *
 * // take the first 3 items from a stream
 * inStream // => ['b', 'a', 'n', 'a', 'n', 'a']
 *   .pipe(nodeStream.take(3))
 *   .pipe(process.stdout)
 *   // => ['b', 'a', 'n']
 */
function take(n) {
  var idx = 0;

  return map(function (chunk, next) {
    idx += 1;

    if (!_.isInteger(n)) {
      return next(new TypeError('Expected `n` to be an integer.'));
    }

    // take n items from the source stream
    if (idx <= n) {
      return next(null, chunk);
    }

    // drop all other items
    return next();
  });
}

module.exports = take;
