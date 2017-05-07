var through = require('through2');

var makeAsync = require('../_utils/makeAsync.js');

/**
 * Creates a new stream with all elements that pass the test implemented by the
 * provided function. Similar to Array.filter... but on a stream.
 *
 * @static
 * @since    1.0.0
 * @category Modifiers
 *
 * @param    {Function} condition - Function that filters elements on the stream.
 *                                  Takes one argument, the value of the item at
 *                                  this position in the stream.
 * @returns  {Stream.Transform}   - A transform stream with the filtered values.
 *
 * @example
 *
 * // If you wanted to create a new stream whose values all passed a certain criteria,
 * // you could do something like the following. Assuming "test-scores.txt" is a file
 * // containing the following data:
 * // Sally...90
 * // Tommy...94
 * // Jimmy...12
 * // Sarah...82
 * // Jonny...64
 *
 * // We can write a function that returns the students who are failing:
 * fs.createReadStream('test-scores.txt')
 *   .pipe(nodeStream.split()) // split on new lines
 *   .pipe(nodeStream.filter(value => {
 *     const [student, testScore] = value.toString().split('...');
 *
 *     return Number(testScore) < 70;
 *   }));
 *
 * // The resulting stream would have the following data:
 * // Jimmy...12
 * // Jonny...64
 *
 * @example
 *
 * // It is also possible to filter a stream asynchronously for more complex actions.
 * // Note: The signature of the function that you pass as the callback is important. It
 * // MUST have *two* parameters.
 *
 * // Assuming "filenames.txt" is a newline-separated list of file names, you could
 * // create a new stream with only valid names by doing something like the following:
 * fs.createReadStream('filenames.txt')
 *   .pipe(nodeStream.split()) // split on new lines
 *   .pipe(nodeStream.filter((value, next) => {
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
 * // The resulting stream will contain the filenames that passed the test. Note: If `next`
 * // is called with an error as the first argument, the stream will error. This is typical
 * // behavior for node callbacks.
 */
function filter(condition) {
  var cb = makeAsync(condition, 2);

  return through.obj(function (chunk, enc, next) {

    cb(chunk, function (err, keep) {

      if (err) {
        return next(err);
      }

      if (keep) {
        return next(null, chunk);
      }

      return next();
    });
  });
}

module.exports = filter;
