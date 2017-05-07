var through = require('through2');
var pipeline = require('../../modifiers/pipeline.js');

var parse = require('../../modifiers/parse.js');

/**
 * Create a through stream that simply calls a callback with the contents.
 * Make sure to also pass the data along so the stream continues.
 *
 * @private
 * @static
 * @since    1.3.0
 * @category Utilities
 *
 * @param    {Function}  onData - Callback with an error or parsed JSON.
 * @returns  {Stream}           - Transform Stream
 */
function throughWithCallback(onData) {

  return through.obj(function (chunk, enc, next) {

    if (onData) {
      onData(null, chunk);
    }

    next(null, chunk);
  });
}

/**
 * Creates a new stream with a single value that's an array of every item
 * in the stream.
 *
 * @static
 * @method   wait.obj
 * @since    1.0.0
 * @category Consumers
 *
 * @param    {Function} callback - A function to be called with the contents
 *                                 of the stream. This is a convenience to
 *                                 avoid listening to the data/end events of
 *                                 the stream.
 * @returns  {Stream.Transform}  - Transform stream.
 *
 * @example
 *
 * // get all of the items in an object stream
 * objStream
 *   .pipe(nodeStream.wait.obj());
 *   // => [{ 'name': 'paul' }, { 'name': 'lisa' }, { 'name': 'mary' }]
 */
function waitObj(callback) {
  var data = [];

  return pipeline.obj(
    through.obj(
      function transform(chunk, enc, next) {
        data.push(chunk);

        next();
      },
      function Flush(next) {
        this.push(data);

        next();
      }
    ),
    throughWithCallback(callback)
  );
}

/**
 * Creates a new stream with a single value that's a Buffer of the entire
 * contents of the stream.
 *
 * @static
 * @since    1.0.0
 * @category Consumers
 *
 * @param    {Function} callback - A function to be called with the contents
 *                                 of the stream. This is a convenience to
 *                                 avoid listening to the data/end events of
 *                                 the stream.
 * @returns  {Stream.Transform}  - Transform stream.
 *
 * @example
 *
 * // get the entire contents of a file
 * fs.createReadStream('example.txt')
 *   .pipe(nodeStream.wait());
 *   // => Buffer
 */
function wait(callback) {

  return pipeline.obj(
    waitObj(),
    through.obj(function (chunk, enc, next) {
      next(null, Buffer.concat(chunk.map(function (item) {
        return new Buffer(item, enc);
      })));
    }),
    throughWithCallback(callback)
  );
}

/**
 * Creates a new stream with a single value that's an object created
 * by JSON parsing the contents of the entire stream.
 *
 * @static
 * @method   wait.json
 * @since    1.0.0
 * @category Consumers
 *
 * @param    {Function} callback - A function to be called with the contents
 *                                 of the stream. This is a convenience to
 *                                 avoid listening to the data/end events of
 *                                 the stream.
 * @returns  {Stream.Transform}  - Transform stream.
 *
 * @example
 *
 * // parse the JSON contents of a file
 * fs.createReadStream('example.json')
 *   .pipe(nodeStream.wait.json());
 *   // => { 'nanananananananananana': 'batman' }
 */
function waitJson(callback) {

  return pipeline.obj(
    wait(),
    parse(),
    throughWithCallback(callback)
  );
}

wait.obj = waitObj;
wait.json = waitJson;

module.exports = wait;
