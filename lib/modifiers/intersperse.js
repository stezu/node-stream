var through = require('through2');

/**
 * Creates a new stream with the `value` emitted between every item in the source
 * stream.
 *
 * @static
 * @since    1.3.0
 * @category Modifiers
 *
 * @param    {String} value     - Value that should be emitted between every existing item.
 * @returns  {Stream.Transform} - Transform stream.
 *
 * @example
 *
 * // Log some values to the console with new lines interspersed
 * shoppingList // => ['banana', 'apple', 'orange']
 *   .pipe(nodeStream.intersperse('\n'))
 *   .pipe(process.stdout)
 *   // => ['banana', '\n', 'apple', '\n', 'orange']
 */
function intersperse(value) {
  var first = true;

  return through.obj(function Transform(chunk, enc, next) {

    // Emit the value for everything but the first item
    if (first) {
      first = false;
    } else {
      this.push(value);
    }

    // Forward the original data
    next(null, chunk);
  });
}

module.exports = intersperse;
