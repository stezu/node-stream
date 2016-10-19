var stream = require('stream');

/**
 * Determines which version of the API should be used for the given input. If
 * a stream is provided as the first argument use the v1 API, otherwise use
 * the v2 API.
 *
 * @private
 * @param   {Function} v1 - Function to call for a v1 API signature.
 * @param   {Function} v2 - Function to call for a v2 API signature.
 * @returns {Function}    - Function which allows either signature.
 */
function selectVersion(v1, v2) {

  return function (firstParam) {

    // the v1 API took a stream as the first argument
    if (firstParam instanceof stream.Stream) {
      return v1.apply(v1, arguments);
    }

    // the v2 API returns a stream for piping
    return v2.apply(v2, arguments);
  };
}

module.exports = selectVersion;
