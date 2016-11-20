var parse = require('../../_utils/parse.js');

/**
 * Wait for the contents of an object stream.
 *
 * @private
 * @deprecated
 * @static
 * @since    0.0.1
 * @category Consumers
 *
 * @param    {Stream}    stream - Stream that will be read for this function.
 * @param    {Function}  onEnd  - Callback when the stream has been read completely.
 * @returns  {undefined}
 */
function waitObj(stream, onEnd) {
  var data = [];

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

  stream.on('data', function (chunk) {
    data.push(chunk);
  });
  stream.on('error', end);
  stream.on('end', end);
}

/**
 * Wait for the contents of a stream.
 *
 * @private
 * @deprecated
 * @static
 * @since    0.0.1
 * @category Consumers
 *
 * @param    {Stream}    stream - Stream that will be read for this function.
 * @param    {Function}  onEnd  - Callback when the stream has been read completely.
 * @returns  {undefined}
 */
function wait(stream, onEnd) {

  waitObj(stream, function (err, data) {

    if (err) {
      return onEnd(err);
    }

    return onEnd(null, Buffer.concat(data.map(function (item) {
      return new Buffer(item);
    })));
  });
}

/**
 * Wait for the stream contents, then parse for JSON.
 *
 * @private
 * @deprecated
 * @static
 * @since    0.0.2
 * @category Consumers
 *
 * @param    {Stream}    stream - Stream that will be read for this function.
 * @param    {Function}  onEnd  - Callback when the stream has been read completely.
 * @returns  {undefined}
 */
function waitJson(stream, onEnd) {

  wait(stream, function (err, data) {

    if (err) {
      return onEnd(err);
    }

    return parse(data, onEnd);
  });
}

wait.obj = waitObj;
wait.json = waitJson;

module.exports = wait;
