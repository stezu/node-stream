var combiner = require('stream-combiner2');
var through = require('through2');

var getArgs = require('../_utils/getArgs.js');

/**
 * Returns a new stream that writes to the first given stream and reads from
 * the last given stream. All errors are routed to the new output stream. This is a
 * wrapper of {@link https://www.npmjs.com/package/stream-combiner2|stream-combiner2}
 * by {@link https://github.com/substack|substack}.
 *
 * @method
 * @static
 * @since    1.0.0
 * @category Util
 *
 * @param   {...(Stream|Stream[])} streams - A series of streams that will be combined
 *                                           into a single output stream.
 * @returns {Stream}                       - Transform stream.
 *
 * @example
 *
 * // emit the largest line in a file
 * function getLargestLine() {
 *   return nodeStream.pipeline(
 *     nodeStream.split(),
 *     nodeStream.sort((a, b) => {
 *       return a.length < b.length;
 *     }),
 *     nodeStream.take(1)
 *   );
 * }
 *
 * // find the longest line of a haiku
 * process.stdin // => ['refreshing and cool\nlove is ', 'a sweet summer ', 'rain\nthat washes the world']
 *   .pipe(getLargestLine())
 *   // => ['love is a sweet summer rain']
 */
function pipeline() {
  var streams = getArgs(arguments);

  // add a passthrough stream to the front so any stream can emit an error
  streams.unshift(through(function (chunk, enc, next) {
    next(null, chunk);
  }));

  return combiner.apply(combiner, streams);
}

/**
 * Object mode of `pipeline`. Returns a new stream that writes to the first given stream and
 * reads from the last given stream. All errors are routed to the new output stream. This is a
 * wrapper of {@link https://www.npmjs.com/package/stream-combiner2|stream-combiner2}
 * by {@link https://github.com/substack|substack}.
 *
 * @method
 * @static
 * @method   pipeline.obj
 * @since    1.0.0
 * @category Util
 *
 * @param   {...(Stream|Stream[])} streams - A series of streams that will be combined
 *                                           into a single output stream.
 * @returns {Stream.Transform}             - Transform stream.
 *
 * @example
 *
 * // read the contents of a file and parse json
 * function readJson() {
 *   return nodeStream.pipeline.obj(
 *     nodeStream.wait(),
 *     nodeStream.parse()
 *   );
 * }
 *
 * // parse stdin as JSON in a single step
 * process.stdin // => ['{"', 'banana":', '"appl', 'e"}']
 *   .pipe(readJson())
 *   // => { 'banana': 'apple' }
 */
function pipelineObj() {
  var streams = getArgs(arguments);

  // add a passthrough stream to the front so any stream can emit an error
  streams.unshift(through.obj(function (chunk, enc, next) {
    next(null, chunk);
  }));

  return combiner.obj.apply(combiner, streams);
}

pipeline.obj = pipelineObj;

module.exports = pipeline;
