const _ = require('lodash');
const through = require('through2');

const pipeline = require('./pipeline.js');
const wait = require('../consumers/wait.js');
const map = require('./map.js');

/**
 * Creates a new stream where all elements of the source stream have been
 * sorted by the Array.sort method. Each value will be emitted individually.
 *
 * *Note:* This method will buffer all contents of the source stream before
 * sending it. You should not use this method if your source stream is large
 * as it could consume large amounts of memory.
 *
 * @static
 * @since    1.3.0
 * @category Modifiers
 *
 * @param    {Function} compareFunction - A function that will be passed directly
 *                                        to Array.sort for item comparison.
 * @returns  {Stream.Transform}         - Transform stream.
 *
 * @example
 *
 * // sort a stream of numbers
 * objStream // => [10, 3, 9, 2, 4, 1]
 *   .pipe(nodeStream.sort())
 *   // => [1, 2, 3, 4, 9, 10]
 */
function sort(compareFunction) {

  return pipeline.obj(

    // collect all items into an array
    wait.obj(),

    // sort the array
    map((chunk, next) => {

      // compareFunction can be null, undefined or a Function
      if (!_.isNil(compareFunction) && !_.isFunction(compareFunction)) {
        return next(new TypeError('Expected `compareFunction` to be a function.'));
      }

      return next(null, chunk.sort(compareFunction));
    }),

    // expand the array so all input items are re-emitted
    through.obj(function Transform(chunk, enc, next) {
      const self = this;
      const len = chunk.length;

      // Recursively add array items to the stream asynchronously
      const emitNextItem = (i) => {
        setImmediate(() => {
          self.push(chunk[i]);

          // keep pushing items to the stream if more items are available
          if (i < len - 1) {
            emitNextItem(i + 1);

            return;
          }

          // the array has been depleted
          next();
        });
      };

      // Start the asynchronous recursive train
      emitNextItem(0);
    })
  );
}

module.exports = sort;
