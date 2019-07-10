const { Readable } = require('readable-stream');

/**
 * Creates a new readable stream from a promise. This is primarily useful for
 * piping into additional node-stream methods like map, reduce and filter.
 *
 * @static
 * @since    1.6.0
 * @category Creators
 *
 * @param    {Promise} source  - A promise which will be converted to a stream. If the promise
 *                               resolves, each argument becomes a discrete item in the stream.
 *                               If the promise rejects, the stream will emit an "error" event.
 * @returns  {Stream.Readable} - Readable stream.
 *
 * @throws   {TypeError}       - If `source` is not a promise.
 *
 * @example
 *
 * // Create a stream from a promise
 * nodeStream.fromPromise(globby('*.js'))
 *   .pipe(nodeStream.map(fs.readFile));
 *   // => ['contents of file1.js', 'contents of file2.js', 'contents of file3.js']
 */
function fromPromise(source) {
  let callCount = 0;

  // Throw an error if the source is not a promise
  if (
    typeof source !== 'object' ||
    source === null ||
    typeof source.then !== 'function'
  ) {
    throw new TypeError('Expected `source` to be a promise.');
  }

  return new Readable({
    objectMode: true,
    read: function Read() {

      // Increment the number of calls so we know when to push null
      callCount += 1;

      // Listen to the promise and push results if this is the first call
      if (callCount === 1) {

        source.then(
          (data) => this.push(data),
          (err) => {
            process.nextTick(() => {
              this.emit('error', err);
            });
          }
        );

        return;
      }

      // End the stream
      this.push(null);
    }
  });
}

module.exports = fromPromise;
