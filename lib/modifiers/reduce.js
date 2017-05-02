var through = require('through2');

var makeAsync = require('../_utils/makeAsync.js');

/**
 * Creates a new stream with a single item that's produced by calling a reducer with
 * each item of the original stream. Similar to Array.reduce... but on a stream.
 *
 * @static
 * @since    1.0.0
 * @category Modifiers
 *
 * @param    {Function} reducer        - Function that reduces items in the stream. Takes
 *                                       two arguments: the current value of the reduction,
 *                                       and the value of the item at this position in the
 *                                       stream.
 * @param    {*}        [initialValue] - Value to use as the first argument to the first
 *                                       call of the `reducer`.
 * @returns  {Stream.Transform}        - A transform stream that results from the reduction.
 *
 * @example
 *
 * // If you wanted to determine the content-length of a stream, you could do something like
 * // the following. Assuming "example.txt" is a large file, you could determine it's length
 * // by doing the following:
 * fs.createReadStream('example.txt')
 *   .pipe(nodeStream.reduce((length, value) => length + value.length), 0);
 *
 * // The resulting stream will have an integer value representing the length of "example.txt".
 *
 * @example
 *
 * // It is also possible to reduce a stream asynchronously for more complex actions.
 * // Note: The signature of the function that you pass as the callback is important. It
 * // MUST have *three* parameters.
 *
 * // Assuming "twitterers.txt" is a newline-separated list of your favorite tweeters, you
 * // could identify which is the most recently active by using the Twitter API:
 * fs.createReadStream('twitterers.txt')
 *   .pipe(nodeStream.split()) // split on new lines
 *   .pipe(nodeStream.reduce((memo, user, next) => {
 *     twit.get('search/tweets', { q: `from:${user}`, count: 1 }, (err, data) => {
 *
 *       // Error the stream since this request failed
 *       if (err) {
 *         return next(err);
 *       }
 *
 *       // This is the first iteration of the reduction, so we automatically save the tweet
 *       if (!memo) {
 *         return next(null, data);
 *       }
 *
 *       // This tweet is the most recent so far, save it for later
 *       if (new Date(data.statuses.created_at) > new Date(memo.statuses.created_at)) {
 *         return next(null, data);
 *       }
 *
 *       // The tweet we have saved is still the most recent
 *       next(null, memo);
 *     });
 *   }));
 *
 * // The resulting stream will contain the most recent tweet of the users in the list.
 * // Note: If `next` is called with an error as the first argument, the stream will error.
 * // This is typical behavior for node callbacks.
 */
function reduce(reducer, initialValue) {
  var accumulator = initialValue;
  var cb = makeAsync(reducer, 3);

  return through.obj(
    function transform(chunk, enc, next) {

      cb(accumulator, chunk, function (err, result) {
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
