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
 * @param   {Number} time - The interval, in milliseconds, to throttle writes.
 * @returns {Stream}      - Transform stream.
 *
 * @example
 *
 * var input = through.obj();
 *
 * input.pipe(nodeStream.trottle(100));
 *
 * input.write(1);
 * input.write(2);
 *
 * setTimeout(function() {
 *   input.write(3);
 *   input.write(4);
 * }, 100);
 *
 * setTimeout(function() {
 *   input.write(5);
 *   input.write(6);
 * }, 100);
 *
 * // => [[1, 2], [3, 4], [5, 6]]
 *
 */
function throttle(time) {

}

module.exports = throttle;
