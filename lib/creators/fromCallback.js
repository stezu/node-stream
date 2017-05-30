var _ = require('lodash');
var Readable = require('readable-stream/readable');

/**
 * Creates a new readable stream from a function which accepts a node-style callback.
 * This is primarily useful for piping into additional node-stream methods like map,
 * reduce and filter.
 *
 * @static
 * @since    1.6.0
 * @category Creators
 *
 * @param    {Function} source - A function to call which accepts a node-style
 *                               callback as the last argument. When that callback
 *                               is called, this stream will emit all arguments
 *                               as a single array.
 * @returns  {Stream.Readable} - Readable stream.
 *
 * @throws   {TypeError}       - If `source` is not a function.
 *
 * @example
 *
 * // Create a stream from a function callback which is then piped to another node-stream method
 * nodeStream.fromCallback(fs.readdir.bind(this, path.resolve('.')))
 *   .pipe(nodeStream.map(fs.readFile));
 *   // => ['contents of file1.txt', 'contents of file2.js', 'contents of file3.pdf']
 */
function fromCallback(source) {
  var callCount = 0;

  // Throw an error if the source is not a function
  if (typeof source !== 'function') {
    throw new TypeError('Expected `source` to be a function.');
  }

  return new Readable({
    objectMode: true,
    read: function () {
      var self = this;

      // Increment the number of calls so we know when to push null
      callCount += 1;

      // Call the method and push results if this is the first call
      if (callCount === 1) {
        source(_.rest(function (err, parameters) {

          if (err) {
            process.nextTick(function () {
              self.emit('error', err);
            });

            return;
          }

          // Push all parameters of the callback to the stream as an array
          self.push(parameters);
        }));

        return;
      }

      // End the stream
      self.push(null);
    }
  });
}

module.exports = fromCallback;
