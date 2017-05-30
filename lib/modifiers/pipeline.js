var pump = require('pump');
var duplexer = require('duplexer2');
var Readable = require('readable-stream/readable');
var PassThrough = require('readable-stream/passthrough');

var getArgs = require('../_utils/getArgs.js');

/**
 * Turn this stream into a Streams2 readable stream if it isn't already one.
 *
 * @private
 * @param   {Stream}          stream - A stream which may or may not be streams2.
 * @param   {Object}          opts   - Options for the return stream, mainly `objectMode`.
 * @returns {Stream.Readable}        - A Streams2 readable stream.
 */
function wrap(stream, opts) {

  if (typeof stream.read === 'function') {
    return stream;
  }

  return new Readable(opts).wrap(stream);
}

/**
 * Combine an array of streams into a duplex with pipes between them. This is a
 * helper function so we don't have to write different logic for regular and object
 * modes.
 *
 * @private
 * @param   {Stream[]}      input - An array of streams to combine into a duplex.
 * @param   {Object}        opts  - Options for the streams, mainly `objectMode`.
 * @returns {Stream.Duplex}       - A duplex stream.
 */
function combine(input, opts) {
  var first, last, duplex, allStreams;

  // Upgrade to streams2 if required
  var streams = input.map(function (stream) {
    return wrap(stream, opts);
  });

  // Create the duplex stream
  first = new PassThrough(opts);
  last = new PassThrough(opts);
  duplex = duplexer(opts, first, last);
  allStreams = [first].concat(streams).concat([last]);

  // Use pump to do most of the heavy lifting, this will pipe
  // all of the streams together as well as destroy them all if
  // any of them are errored or destroyed.
  pump(allStreams, function (err) {

    if (err) {
      duplex.emit('error', err);
    }
  });

  return duplex;
}

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

  return combine(streams);
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
  var opts = {
    objectMode: true
  };

  // When given no arguments, we should still return a stream
  if (streams.length === 0) {
    return new PassThrough(opts);
  }

  // Since a duplex requires at least two streams, we return single streams
  if (streams.length === 1) {
    return streams[0];
  }

  return combine(streams, opts);
}

pipeline.obj = pipelineObj;

module.exports = pipeline;
