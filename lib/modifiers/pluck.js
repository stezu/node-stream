var _ = require('lodash');

var map = require('./map.js');

/**
 * Creates a new stream with the output composed of the plucked property
 * from each item in the source stream.
 *
 * @static
 * @since    1.3.0
 * @category Modifiers
 *
 * @param    {String|Number} property - A property name that will be plucked from
 *                                      each item in the source stream.
 * @returns  {Stream.Transform}       - Transform stream.
 *
 * @example
 *
 * // get the value of the "age" property for every item in the stream
 * objStream // => [{ name: 'pam', age: 24 }, { name: 'joe', age: 30 }])
 *   .pipe(nodeStream.pluck('age'))
 *   // => [24, 30]
 */
function pluck(property) {
  var matcher = _.property(property);

  return map(function (chunk, next) {

    if (!_.isString(property) && !_.isNumber(property)) {
      return next(new TypeError('Expected `property` to be a string or a number.'));
    }

    return next(null, matcher(chunk));
  });
}

module.exports = pluck;
