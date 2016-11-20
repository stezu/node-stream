var pipeline = require('./pipeline.js');
var filter = require('./filter.js');
var take = require('./take.js');

/**
 * Creates a new Stream with the first element from the source stream
 * where `condition` is true. A convenient form of `filter`.
 *
 * Applies the function `condition` to each item in the stream. The `condition`
 * is called with two arguments:
 *
 * - The stream `item` and
 * - A `callback`.
 *
 * If the `condition` passes an error to its `callback`, the stream emits an "error" event.
 *
 * @static
 * @since    1.4.0
 * @category Modifiers
 *
 * @param    {Function} condition - Function that filters elements on the stream. The
 *                                  function is passed a `callback(err, keep)` which
 *                                  must be called once it's completed.
 * @returns  {Stream}             - Transform stream.
 *
 * @example
 *
 * // find the first element that matches the condition
 * objStream // => [11, 15, 90, 14, 2, 97, 3]
 *   .pipe(nodeStream.find((item, next) => {
 *     next(null, item < 10);
 *   })
 *   // => [2]
 */
function find(condition) {

  return pipeline.obj(
    filter(condition),
    take(1)
  );
}

module.exports = find;
