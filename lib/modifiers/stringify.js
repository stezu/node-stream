const map = require('./map.js');

/**
 * Creates a new stream where every element in the source stream
 * is converted to a string by using `JSON.stringify`.
 *
 * @static
 * @since    1.1.0
 * @category Modifiers
 *
 * @returns  {Stream.Transform} - Transform stream.
 *
 * @example
 *
 * // stringify every element in an object stream so it can be
 * // piped to a non-object stream.
 * objStream
 *   .pipe(nodeStream.stringify())
 *   .pipe(process.stdout);
 */
function stringify() {

  return map((chunk, next) => {

    try {
      return next(null, JSON.stringify(chunk));
    } catch (e) {
      return next(e);
    }
  });
}

module.exports = stringify;
