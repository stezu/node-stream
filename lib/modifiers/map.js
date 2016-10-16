var through = require('through2');

/**
 * Creates a new stream with the results of calling the provided function on
 * every element in the stream.
 *
 * Applies the function `transform` to each item in the stream. The `transform`
 * is called with two arguments:
 * - The stream `item` and
 * - A `callback`.
 * If the `transform` passes an error to its `callback`, the stream emits an "error" event.
 *
 * @static
 * @memberOf nodeStream
 * @since    1.0.0
 * @category Modifiers
 *
 * @param    {Function} transform - Function that produces a new element on the stream.
 *                                  The function is passed a `callback(err, value)` which
 *                                  must be called once it's completed.
 * @returns  {Stream}             - Transform stream that you can pipe into.
 *
 * @example
 *
 * // replace every period with a comma to create a run-on sentence
 * fs.createReadStream('example.txt') // the text has periods. because, english.
 *   .pipe(nodeStream.map((value, next) => {
 *     const str = value.toString()
 *     next(null, str.replace('.', ','));
 *   }))
 *   // => the text has periods, because, english,
 *
 *
 * // parse a newline-separated JSON file
 * fs.createReadStream('example.log')
 *   .pipe(nodeStream.split())
 *   .pipe(nodeStream.map((value, next) => {
 *     let parsed;
 *
 *     try {
 *       parsed = JSON.parse(value);
 *     } catch(e) {
 *       return next(e); // failed to parse, emit an error on the stream
 *     }
 *
 *     next(null, parsed); // emit a parsed object on the stream
 *   }));
 */
function map(transform) {

  return through.obj(function (value, enc, next) {
    transform(value, next);
  });
}

module.exports = map;
