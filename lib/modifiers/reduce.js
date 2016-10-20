var through = require('through2');

/**
 * Creates a new stream with a single value that's produced by calling a reducer
 * with each element of the original array.
 *
 * Applies the function `reducer` to each item in the stream. The `reducer`
 * is called with three arguments:
 * - The value previously returned in the last invocation of the callback, or
 *   initialValue, if supplied.
 * - The stream `item` and
 * - A `callback`.
 * If the `reducer` passes an error to its `callback`, the stream emits an "error" event.
 *
 * @static
 * @since    1.0.0
 * @category Modifiers
 *
 * @param    {Function} reducer        - Function that reduces elements on the stream.
 *                                       The function is passed a `callback(err, result)`
 *                                       which must be called once it's completed.
 * @param    {*}        [initialValue] - Value to use as the first argument to the first
 *                                       call of the `reducer`.
 * @returns  {Stream}                  - Transform stream.
 *
 * @example
 *
 * // determine the content length of the given stream
 * fs.createReadStream('example.txt')
 *   .pipe(nodeStream.reduce((size, value, next) => {
 *     next(null, size + value.length);
 *   }, 0))
 *
 *
 * // find the most popular authors in an object stream
 * objStream
 *   .pipe(nodeStream.reduce((authors, value, next) => {
 *
 *     if (typeof value.author === 'undefined') {
 *       return next(new Error('unknown data')); // emit an error on the stream
 *     }
 *
 *     if (!authors[value.author]) {
 *       authors[value.author] = 0;
 *     }
 *
 *     authors[value.author] += 1;
 *
 *     return next(null, authors);
 *   }, {}));
 *   // => { 'paul': 4, 'lisa': 12, 'mary': 1 }
 */
function reduce(reducer, initialValue) {
  var accumulator = initialValue;

  return through.obj(
    function transform(chunk, enc, next) {

      reducer(accumulator, chunk, function (err, result) {
        accumulator = result;
        next(err);
      });
    },
    function Flush(next) {
      this.push(accumulator);
      next();
    }
  );
}

module.exports = reduce;
