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
  var timeout, output;

  /**
   * @private
   * @description
   * Writes all the collected data to the stream.
   *
   * @param {Stream} stream - The stream to write to.
   * @returns {undefined}
   */
  function writeCache(stream) {
    stream.push(cache.splice(0, count || cache.length));
  }

  output = through.obj(function onData(data, enc, cb) {
    cache.push(data);

    if (firstWrite) {
      firstWrite = false;

      writeCache(output);
      cb();

      return;
    }

    if (!timeout) {
      timeout = setTimeout(function () {
        writeCache(output);
        timeout = null;
      }, milliseconds);
    }

    cb();
  }, function onFlush(cb) {
    if (timeout) {
      clearTimeout(timeout);
    }

    if (cache.length === 0) {
      return cb();
    }

    return setTimeout(function () {
      writeCache(output);

      cb();
    }, milliseconds);
  });

  return output;
}

module.exports = throttle;
