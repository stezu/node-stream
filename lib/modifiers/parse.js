var map = require('./map.js');

/**
 * Creates a new stream where every element in the source stream
 * is parsed as JSON.
 *
 * @static
 * @since    1.1.0
 * @category Modifiers
 *
 * @returns  {Stream} - Transform stream.
 *
 * @example
 *
 * // parse a newline-separated JSON file
 * fs.createReadStream('example.log')
 *   .pipe(nodeStream.split())
 *   .pipe(nodeStream.parse());
 *
 *
 * // parse a large JSON file
 * fs.createReadStream('warandpeace.json')
 *   .pipe(nodeStream.wait())
 *   .pipe(nodeStream.parse());
 */
function parse() {

  return map(function (chunk, next) {
    var parsed;

    try {
      parsed = JSON.parse(chunk);
    } catch (e) {
      return next(e);
    }

    return next(null, parsed);
  });
}

module.exports = parse;
