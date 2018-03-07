var pumpify = require('pumpify');
var PassThrough = require('readable-stream/passthrough');

var getArgs = require('../_utils/getArgs.js');

/**
 * Pipes all given streams together and destroys all of them if one of them
 * closes. In addition, it returns a Duplex stream that you can write to and
 * read from as well. This is primarily used to create a single stream to an
 * outside caller that internally is made up of many streams. It's also
 * especially useful for handling errors on all of the streams in a pipeline
 * with a single error handler on the returned Duplex.
 *
 * @method
 * @static
 * @since    1.0.0
 * @category Util
 *
 * @param   {...(Stream|Stream[])} streams - A series of streams that will be combined
 *                                           into a single output stream.
 * @returns {Stream.Duplex}                - Duplex stream.
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

  // When given no arguments, we should still return a stream
  if (streams.length === 0) {
    return new PassThrough();
  }

  // Since a duplex requires at least two streams, we return single streams
  if (streams.length === 1) {
    return streams[0];
  }

  return pumpify(streams);
}

/**
 * Object mode of `pipeline`. Pipes all given streams together and destroys all
 * of them if one of them closes. In addition, it returns a Duplex stream that
 * you can write to and read from as well. This is primarily used to create a
 * single stream to an outside caller that internally is made up of many streams.
 * It's also especially useful for handling errors on all of the streams in a pipeline
 * with a single error handler on the returned Duplex.
 *
 * @method
 * @static
 * @method   pipeline.obj
 * @since    1.0.0
 * @category Util
 *
 * @param   {...(Stream|Stream[])} streams - A series of streams that will be combined
 *                                           into a single output stream.
 * @returns {Stream.Duplex}                - Duplex stream.
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

  // When given no arguments, we should still return a stream
  if (streams.length === 0) {
    return new PassThrough({ objectMode: true });
  }

  // Since a duplex requires at least two streams, we return single streams
  if (streams.length === 1) {
    return streams[0];
  }

  return pumpify.obj(streams);
}

pipeline.obj = pipelineObj;

module.exports = pipeline;
