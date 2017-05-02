var _ = require('lodash');

var map = require('./map.js');

/**
 * Creates a new stream where every element in the source stream
 * is parsed as JSON.
 *
 * @static
 * @since    1.1.0
 * @category Modifiers
 *
 * @param    {Object}  [options]              - Options to use when parsing items in the stream.
 * @param    {Boolean} [options.error = true] - If true, an error caught when parsing JSON
 *                                              will be emitted on the stream. If false, the
 *                                              unparseable item will be removed from the stream
 *                                              without error.
 * @returns  {Stream.Transform}               - Transform stream.
 *
 * @example
 *
 * // parse a newline-separated JSON file
 * fs.createReadStream('example.log')
 *   .pipe(nodeStream.split())
 *   .pipe(nodeStream.parse());
 *
 * @example
 *
 * // parse a large JSON file
 * fs.createReadStream('warandpeace.json')
 *   .pipe(nodeStream.wait())
 *   .pipe(nodeStream.parse());
 */
function parse(options) {
  var settings = _.extend({
    error: true
  }, options);

  return map(function (chunk, next) {
    var parsed;

    try {
      parsed = JSON.parse(chunk);
    } catch (e) {

      if (settings.error === true) {
        return next(e);
      }

      return next();
    }

    return next(null, parsed);
  });
}

module.exports = parse;
