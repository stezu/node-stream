var pipeline = require('./pipeline.js');
var where = require('./where.js');
var take = require('./take.js');

/**
 * Creates a new Stream with the first element from the source stream
 * that matches the `query`. A convenient form of `where`. It performs
 * a deep comparison between a given `query` and items in the source
 * stream. Items that match the `query` are forwarded to the output
 * stream.
 *
 * @static
 * @since    1.4.0
 * @category Modifiers
 *
 * @param    {Object} query     - An object of properties to compare against all items in
 *                                the source stream.
 * @returns  {Stream.Transform} - Transform stream.
 *
 * @example
 *
 * // find the first element that matches the condition
 * objStream // => [{ name: 'Bob', age: 30 }, { name: 'Lisa', age: 30 }]
 *   .pipe(nodeStream.findWhere({ age: 30 })
 *   // => [{ name: 'Bob', age: 30 }]
 */
function findWhere(query) {

  return pipeline.obj(
    where(query),
    take(1)
  );
}

module.exports = findWhere;
