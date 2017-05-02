var _ = require('lodash');

var filter = require('./filter.js');

/**
 * A convenient form of filter which performs a deep comparison between a given `query`
 * and items in the source stream. Items that match the `query` are forwarded to the output
 * stream.
 *
 * @static
 * @since    1.3.0
 * @category Modifiers
 *
 * @param    {Object} query     - An object of properties to compare against all items in
 *                                the source stream.
 * @returns  {Stream.Transform} - Transform stream.
 *
 * @example
 *
 * // Get all users from a given zip code
 * users // => [{ name: 'Bill', zip: 90210 }, { name: 'Tracy', zip: 33193 }, { name: 'Paul', zip: 90210 }]
 *   .pipe(nodeStream.where({ zip: 90210 }))
 *   // => [{ name: 'Bill', zip: 90210 }, { name: 'Paul', zip: 90210 }]
 */
function where(query) {
  var matcher = _.matches(query);

  return filter(function (value, next) {

    if (!_.isPlainObject(query)) {
      return next(new TypeError('Expected `query` to be an object.'));
    }

    return next(null, matcher(value));
  });
}

module.exports = where;
