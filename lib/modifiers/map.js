var through = require('through2');

var makeAsync = require('../_utils/makeAsync.js');

/**
 * Creates a new stream with the results of calling the provided function on
 * every item in the stream. Similar to Array.map... but on a stream.
 *
 * @static
 * @since    1.0.0
 * @category Modifiers
 *
 * @param    {Function} transform - Function that returns a new element on the
 *                                  stream. Takes one argument, the value of the
 *                                  item at this position in the stream.
 * @returns  {Stream.Transform}   - A transform stream with the modified values.
 *
 * @example
 *
 * // For a simple find/replace, you could do something like the following. Assuming
 * // "example.txt" is a file with the text "the text has periods. because, english.",
 * // you could replace each period with a comma like so:
 * fs.createReadStream('example.txt')
 *   .pipe(nodeStream.map(value => value.toString().replace('.', ',')));
 *
 * // The resulting stream will have the value "the text has periods, because, english,".
 *
 * @example
 *
 * // It is also possible to transform a stream asynchronously for more complex actions.
 * // Note: The signature of the function that you pass as the callback is important. It
 * // MUST have *two* parameters.
 *
 * // Assuming "filenames.txt" is a newline-separated list of file names, you could
 * // create a new stream with their contents by doing something like the following:
 * fs.createReadStream('filenames.txt')
 *   .pipe(nodeStream.split()) // split on new lines
 *   .pipe(nodeStream.map((value, next) => {
 *     fs.readFile(value, next);
 *   }));
 *
 * // The resulting stream will contain the text of each file. Note: If `next` is called
 * // with an error as the first argument, the stream will error. This is typical behavior
 * // for node callbacks.
 */
function map(transform) {
  var cb = makeAsync(transform, 2);

  return through.obj(function (value, enc, next) {
    cb(value, next);
  });
}

module.exports = map;
