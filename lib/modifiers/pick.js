var _ = require('lodash');

var map = require('./map.js');

/**
 * Creates a new stream with the output composed of the picked properties from the source stream.
 *
 * @static
 * @since    1.3.0
 * @category Modifiers
 *
 * @param    {...String} properties - A collection of properties that will
 *                                    be picked from the source object.
 * @returns  {Stream.Transform}     - Transform stream.
 *
 * @example
 *
 * // get some properties from each item in the stream
 * // (e.g.: [{ name: 'pam', age: 24 }, { name: 'joe', age: 30 }])
 * objStream
 *   .pipe(nodeStream.pick('age'))
 *   // => [{ age: 24 }, { age: 30 }]
 */
function pick(properties) {

  return map(function (chunk, next) {

    if (!_.isPlainObject(chunk)) {
      return next(new TypeError('Expected object, got ' + typeof chunk));
    }

    return next(null, _.pick(chunk, properties));
  });
}

module.exports = _.rest(pick);
