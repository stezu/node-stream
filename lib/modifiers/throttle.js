var through = require('through2');

/**
 * Returns a new stream that combines and throttles writes based on a specific interval. All
 * writes during that time will be collected and emitted all at once at most one per interval.
 *
 * @method
 * @static
 * @since    TODO
 * @category Util
 *
 * @param   {Number} milliseconds - The interval, in milliseconds, to throttle writes.
 * @returns {Stream}              - Transform stream.
 *
 * @example
 *
 * var input = through.obj();
 *
 * input.pipe(nodeStream.trottle(100));
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
function throttle(milliseconds) {
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
    stream.push(cache);
    cache = [];
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
