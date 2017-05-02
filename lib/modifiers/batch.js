var through = require('through2');
var _ = require('lodash');

/**
 * @private
 * @description Validate that the given value is an integer above `minimum`.
 *
 * @param   {Number} value   - The value to compare.
 * @param   {Number} minimum - The minimum allowed value.
 *
 * @returns {Boolean} Whether the value meets the condition.
 */
function isOptionalIntAbove(value, minimum) {

  if (_.isUndefined(value)) {
    return true;
  }

  if (!_.isInteger(value) || value < minimum) {
    return false;
  }

  return true;
}

/**
 * @private
 * @description Performs validation on the #batch settings.
 *
 * @param   {Object} options - The options provided to #batch.
 *
 * @returns {Error|null} An error, if one is appropriate
 */
function validateOptions(options) {
  if (_.isNil(options)) {
    return null;
  }

  if (!_.isPlainObject(options)) {
    return new TypeError('Expected `options` to be an object or not defined.');
  }

  if (!isOptionalIntAbove(options.time, 0)) {
    return new TypeError('Expected `options.time` to be an integer that is 0 or greater.');
  }

  if (!isOptionalIntAbove(options.count, 1)) {
    return new TypeError('Expected `options.count` to be an integer greater than 0.');
  }

  return null;
}

/**
 * Returns a new stream that batches writes based on a specific interval, count of items, or both.
 * All items read on the stream and will be re-emitted as part of an array of one or more items
 * based on the criteria defined in the options.
 *
 * @method
 * @static
 * @since    1.5.0
 * @category Modifiers
 *
 * @param   {Object} [options]         - Define how items will be batched and written to the
 *                                       the stream. Note that when both `time` and `count` are
 *                                       defined, items will be written to the stream whenever
 *                                       either one of the conditions is met.
 * @param   {Number} [options.time=0]  - The interval, in milliseconds, to limit writes to.
 *                                       During that time, all items read on the stream will
 *                                       be collected and written as an array at the set
 *                                       interval.
 * @param   {Number} [options.count=1] - The number of items to buffer before writing all
 *                                       of them in an array.
 * @returns {Stream.Transform}         - Transform stream.
 *
 * @example
 *
 * const input = nodeStream.through.obj();
 *
 * input.pipe(nodeStream.batch({ time: 100 }));
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
 * @example
 *
 * const input = nodeStream.through.obj();
 *
 * input.pipe(nodeStream.batch({ count: 2 }));
 *
 * input.write(1);
 * input.write(2);
 * input.write(3);
 * input.write(4);
 * input.write(5);
 *
 * // => [[1, 2], [3, 4], [5]]
 */
function batch(options) {
  var validationError = validateOptions(options);

  var settings = _.extend({
    time: 0,
    count: 0
  }, options);

  var cache = [];
  var lastWrite = 0;
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
    lastWrite = Date.now();

    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }

    stream.push(cache.splice(0, settings.count || cache.length));
  }

  /**
   * @private
   * @description
   * Flushes the cache using the defined timeout.
   *
   * @param {Stream} stream    - The stream to write to.
   * @param {Function} onFlush - The function to call when
   *                             the cache is flushed.
   * @returns {undefined}
   */
  function flushCacheTimed(stream, onFlush) {
    var nextWrite = lastWrite + settings.time;
    var now = Date.now();

    // we are overdue for a write, so write now
    if (now >= nextWrite) {
      flushCache(stream);
      onFlush();

      return;
    }

    // write after the remainder between now and when
    // the next write should be according to milliseconds
    // and the previous write
    timeout = setTimeout(function () {
      flushCache(stream);
      onFlush();
    }, nextWrite - now);
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
      (!settings.count && !settings.time) ||
      // the count has been met
      (settings.count && cache.length === settings.count)
    ) {
      flushCache(stream);

      return;
    }

    if (settings.time && !timeout) {
      flushCacheTimed(stream, _.noop);
    }
  }

  return through.obj(function Transform(data, enc, cb) {
    var self = this;

    if (validationError) {
      cb(validationError);

      return;
    }

    // initialize now if it is not yet initialized, so that we
    // start time batching from now on
    if (!lastWrite) {
      lastWrite = Date.now();
    }

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

    return flushCacheTimed(self, cb);
  });
}

module.exports = batch;
