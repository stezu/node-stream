
/**
 * Read the items in a stream.
 *
 * @private
 * @deprecated
 * @static
 * @since    0.0.1
 * @category Consumers
 *
 * @param    {Stream}    stream - Stream that will be read for this function.
 * @param    {Function}  onData - Callback for each item in the stream.
 * @param    {Function}  onEnd  - Callback when the stream has been read completely.
 * @returns  {undefined}
 */
function forEachObj(stream, onData, onEnd) {
  stream.on('data', onData);
  stream.on('error', onEnd);
  stream.on('end', onEnd);
}

/**
 * Read the items in a stream and convert to buffers.
 *
 * @private
 * @deprecated
 * @static
 * @since    0.0.1
 * @category Consumers
 *
 * @param    {Stream}    stream - Stream that will be read for this function.
 * @param    {Function}  onData - Callback for each item in the stream.
 * @param    {Function}  onEnd  - Callback when the stream has been read completely.
 * @returns  {undefined}
 */
function forEach(stream, onData, onEnd) {

  forEachObj(stream, function (chunk) {
    onData(new Buffer(chunk));
  }, onEnd);
}

/**
 * Read the items in a stream and parse each item for JSON.
 *
 * @private
 * @deprecated
 * @static
 * @since    0.0.2
 * @category Consumers
 *
 * @param    {Stream}    stream - Stream that will be read for this function.
 * @param    {Function}  onData - Callback for each item in the stream.
 * @param    {Function}  onEnd  - Callback when the stream has been read completely.
 * @returns  {undefined}
 */
function forEachJson(stream, onData, onEnd) {

  forEach(stream, function (chunk) {
    var parsed;

    try {
      parsed = JSON.parse(chunk);
    } catch (e) {
      return stream.emit('error', e);
    }

    return onData(parsed);
  }, onEnd);
}

forEach.obj = forEachObj;
forEach.json = forEachJson;

module.exports = forEach;
