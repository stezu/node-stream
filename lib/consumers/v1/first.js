var parse = require('../../_utils/parse.js');

/**
 * Get the first item in a stream.
 *
 * @private
 * @deprecated
 * @static
 * @since    0.0.4
 * @category Consumers
 *
 * @param    {Stream}    stream - Stream that will be read for this function.
 * @param    {Function}  onEnd  - Callback when the stream has been read completely.
 * @returns  {undefined}
 */
function firstObj(stream, onEnd) {
  var data;

  /**
   * Send the correct data to the onEnd callback.
   *
   * @private
   * @param   {Error}     [err] - Optional error.
   * @returns {undefined}
   */
  function end(err) {

    if (err) {
      return onEnd(err);
    }

    return onEnd(null, data);
  }

  stream.once('data', function (chunk) {
    data = chunk;
  });
  stream.on('error', end);
  stream.on('end', end);
}

/**
 * Get the first item in a stream and convert to a buffer.
 *
 * @private
 * @deprecated
 * @static
 * @since    0.0.4
 * @category Consumers
 *
 * @param    {Stream}    stream - Stream that will be read for this function.
 * @param    {Function}  onEnd  - Callback when the stream has been read completely.
 * @returns  {undefined}
 */
function first(stream, onEnd) {

  firstObj(stream, function (err, data) {

    if (err) {
      return onEnd(err);
    }

    return onEnd(null, new Buffer(data));
  });
}

/**
 * Get the first item in a stream and parse it for JSON.
 *
 * @private
 * @deprecated
 * @static
 * @since    0.0.4
 * @category Consumers
 *
 * @param    {Stream}    stream - Stream that will be read for this function.
 * @param    {Function}  onEnd  - Callback when the stream has been read completely.
 * @returns  {undefined}
 */
function firstJson(stream, onEnd) {

  first(stream, function (err, data) {

    if (err) {
      return onEnd(err);
    }

    return parse(data, onEnd);
  });
}

first.obj = firstObj;
first.json = firstJson;

module.exports = first;
