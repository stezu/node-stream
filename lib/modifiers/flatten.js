var _ = require('lodash');
var through = require('through2');

/**
 * Returns a new stream that flattens all arrays passing through by one level. All non-array
 * items will be passed through as-is.
 *
 * @method
 * @static
 * @since    1.5.0
 * @category Modifiers
 *
 * @returns {Stream.Transform} - Transform stream.
 *
 * @example
 *
 * const input = nodeStream.through.obj();
 *
 * input.pipe(nodeStream.flatten());
 *
 * input.write([1, 2, 3]);
 * input.write([4, 5]);
 * input.write(6);
 *
 * // => [1, 2, 3, 4, 5, 6]
 *
 * @example
 *
 * const input = nodeStream.through.obj();
 *
 * input
 *   // batch items that are read
 *   .pipe(nodeStream.batch({ count: 2 }))
 *   // perform a transform action on the batches
 *   .pipe(transformBatch())
 *   // flatten the batches back
 *   .pipe(nodeStream.flatten());
 *
 * input.write(1);
 * input.write(2);
 * input.write(3);
 * input.write(4);
 * input.write(5);
 *
 * // => [1, 2, 3, 4, 5]
 */
function flatten() {
  return through.obj(function Transform(data, enc, cb) {
    var self = this;

    if (!_.isArray(data)) {
      return cb(null, data);
    }

    data.forEach(function (val) {
      self.push(val);
    });

    return cb();
  });
}

module.exports = flatten;
