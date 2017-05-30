var Readable = require('readable-stream/readable');

/**
 * Creates a new readable stream from an array. This is primarily useful for
 * piping into additional node-stream methods like map, reduce and filter.
 *
 * @static
 * @since    1.6.0
 * @category Creators
 *
 * @param    {Array} source    - An array which will be converted to a stream. If an item
 *                               in the array is `null` the stream will end early. Every
 *                               other data type is allowed and valid.
 * @returns  {Stream.Readable} - Readable stream.
 *
 * @throws   {TypeError}       - If `source` is not an array.
 *
 * @example
 *
 * // Create a stream from an array which is then piped to another node-stream method
 * nodeStream.fromArray(['file1.txt', 'file2.txt', 'file3.txt'])
 *   .pipe(nodeStream.map(fs.readFile));
 *   // => ['contents of file1.txt', 'contents of file2.txt', 'contents of file3.txt']
 */
function fromArray(source) {
  var data;

  if (!Array.isArray(source)) {
    throw new TypeError('Expected `source` to be an array.');
  }

  // Copy the source array so we can modify it at will
  data = source.slice();

  return new Readable({
    objectMode: true,
    read: function () {

      if (data.length > 0) {
        this.push(data.shift());
      } else {
        this.push(null);
      }
    }
  });
}

module.exports = fromArray;
