var pipeline = require('./pipeline.js');
var filter = require('./filter.js');
var take = require('./take.js');

/**
 * Creates a new Stream with the first element from the source stream
 * where `condition` is true. A convenient form of `filter`.
 *
 * @static
 * @since    1.4.0
 * @category Modifiers
 *
 * @param    {Function} condition - Function that filters elements on the stream.
 *                                  Takes one argument, the value of the item at
 *                                  this position in the stream.
 * @returns  {Stream.Transform}   - A transform stream with the first value that
 *                                  passed the test.
 *
 * @example
 *
 * // If you wanted to create a new stream with the first value that passed a certain
 * // criteria, you could do something like the following. Assuming "test-scores.txt"
 * // is a file containing the following data:
 * // Sally...90
 * // Tommy...94
 * // Jimmy...12
 * // Sarah...82
 * // Jonny...64
 *
 * // We can write a function that returns the first failing student:
 * fs.createReadStream('test-scores.txt')
 *   .pipe(nodeStream.split()) // split on new lines
 *   .pipe(nodeStream.find(value => {
 *     const [student, testScore] = value.toString().split('...');
 *
 *     return Number(testScore) < 70;
 *   }));
 *
 * // The resulting stream would have the following data:
 * // Jimmy...12
 *
 * @example
 *
 * // It is also possible to filter a stream asynchronously for more complex actions.
 * // Note: The signature of the function that you pass as the callback is important. It
 * // MUST have *two* parameters.
 *
 * // Assuming "filenames.txt" is a newline-separated list of file names, you could
 * // create a new stream with the first valid filename by doing something like the following:
 * fs.createReadStream('filenames.txt')
 *   .pipe(nodeStream.split()) // split on new lines
 *   .pipe(nodeStream.find((value, next) => {
 *     fs.stat(value, (err, stats) => {
 *
 *       // Error the stream since this file is not valid
 *       if (err) {
 *         return next(err);
 *       }
 *
 *       next(null, stats.isFile());
 *     });
 *   }));
 *
 * // The resulting stream will contain the first filename that passed the test. Note: If `next`
 * // is called with an error as the first argument, the stream will error. This is typical
 * // behavior for node callbacks.
 */
function find(condition) {

  return pipeline.obj(
    filter(condition),
    take(1)
  );
}

module.exports = find;
