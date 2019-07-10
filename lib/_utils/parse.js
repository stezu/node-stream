/**
 * Parse the contents of a string as JSON.
 *
 * @private
 * @static
 * @since    1.3.0
 * @category Utilities
 *
 * @param    {String}    data     - String you would like to parse as JSON.
 * @param    {Function}  callback - Callback with an error or parsed JSON.
 * @returns  {undefined}
 */
function parse(data, callback) {

  try {
    return callback(null, JSON.parse(data));
  } catch (e) {
    return callback(e);
  }
}

module.exports = parse;
