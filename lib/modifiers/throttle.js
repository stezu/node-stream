var through = require('through2');
var _ = require('lodash');

/**
 * Returns a new stream that combines and throttles writes based on a specific interval. All
 * writes during that time will be collected and emitted all at once at most one per interval.
 *
 * @method
 * @static
 * @since    TODO
 * @category Util
 *
 * @param   {Object} [options]       - Define how items will be batched and written to the
 *                                     the stream. Note that when both `time` and `count` are
 *                                     defined, items will be written to the stream whenever
 *                                     either one of the conditions is met.
 * @param   {Number} [options.time]  - The interval, in milliseconds, to limit writes to.
 *                                     During that time, all items read on the stream will
 *                                     be collected and written as an array at the set
 *                                     interval.
 * @param   {Number} [options.count] - The number of items to buffer before writing all
 *                                     of them in an array.
 * @returns {Stream}                 - Transform stream.
 *
 * @example
 *
 * var input = through.obj();
 *
 * input.pipe(nodeStream.trottle({ time: 100 }));
 *
 * input.write(1);
 *
 * setTimeout(function() {
 *   input.write(2);
 *   input.write(3);
 * }, 100);
 *
 * setTimeout(function() {
 *   input.write(4);
 *   input.write(5);
 * }, 200);
 *
 * // => [[1], [2, 3], [4, 5]]
 *
 */
function throttle(options) {
  var opts = _.isPlainObject(options) ? options : {};
  var milliseconds = opts.time || 0;
  var count = opts.count || 0;
  var cache = [];
  var firstWrite = true;
  var timeout;

  /**
   * @private
   * @description
   * Writes all the collected data to the stream.
   *
   * @param {Stream} stream - The stream to write to.
   * @returns {undefined}
   */
  function flushCache(stream) {
    firstWrite = false;

    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }

    stream.push(cache.splice(0, count || cache.length));
  }

  /**
   * @private
   * @description
   * Flushes the cache if it is appropriate to do so.
   *
   * @param {Stream} stream - The stream to write to.
   * @returns {undefined}
   */
  function writeIfPossible(stream) {
    if (
      // we don't have a count or a time set,
      (!count && !milliseconds) ||
      // the count has been met
      (count && cache.length === count)
    ) {
      flushCache(stream);

      return;
    }

    if (milliseconds && !timeout) {
      if (firstWrite) {
        flushCache(stream);
      } else {
        timeout = setTimeout(flushCache.bind(null, stream), milliseconds);
      }
    }
  }

  return through.obj(function Transform(data, enc, cb) {
    var self = this;

    cache.push(data);

    writeIfPossible(self);

    cb();
  }, function Flush(cb) {
    var self = this;

    if (timeout) {
      clearTimeout(timeout);
    }

    if (cache.length === 0) {
      return cb();
    }

    return setTimeout(function () {
      flushCache(self);

      cb();
    }, milliseconds);
  });
}

module.exports = throttle;
