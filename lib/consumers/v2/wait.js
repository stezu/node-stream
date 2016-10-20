var through = require('through2');
var pipeline = require('stream-combiner2');

/**
 * Creates a new stream with a single value that's an array of every item
 * in the stream.
 *
 * @static
 * @since    1.0.0
 * @category Consumers
 *
 * @returns  {Stream} - Transform stream.
 *
 * @example
 *
 * // get all of the items in an object stream
 * objStream
 *   .pipe(nodeStream.wait.obj());
 *   // => [{ 'name': 'paul' }, { 'name': 'lisa' }, { 'name': 'mary' }]
 */
function waitObj() {
  var data = [];

  return through.obj(
    function transform(chunk, enc, next) {
      data.push(chunk);
      next();
    },
    function Flush(next) {
      this.push(data);

      next();
    }
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
 * @returns  {Stream} - Transform stream.
 *
 * @example
 *
 * // get the contents of a file
 * fs.createReadStream('example.txt')
 *   .pipe(nodeStream.wait());
 *   // => Buffer
 */
function wait() {

  return pipeline.obj(
    waitObj(),
    through.obj(function (chunk, enc, next) {
      next(null, Buffer.concat(chunk.map(function (item) {
        return new Buffer(item);
      })));
    })
  );
}

/**
 * Creates a new stream with a single value that's an object created
 * by JSON parsing the contents of the entire stream.
 *
 * @static
 * @since    1.0.0
 * @category Consumers
 *
 * @returns  {Stream} - Transform stream.
 *
 * @example
 *
 * // parse the JSON contents of a file
 * fs.createReadStream('example.txt')
 *   .pipe(nodeStream.wait.obj());
 *   // => [{ 'nanananananananananana': 'batman' }]
 */
function waitJson() {

  return pipeline.obj(
    wait(),
    through.obj(function (chunk, enc, next) {

      try {
        return next(null, JSON.parse(chunk));
      } catch (e) {
        return next(e);
      }
    })
  );
}

wait.obj = waitObj;
wait.json = waitJson;

module.exports = wait;
