// Consumers
const v2Wait = require('./consumers/wait.js');

// Creators
const fromArray = require('./creators/fromArray.js');
const fromCallback = require('./creators/fromCallback.js');
const fromPromise = require('./creators/fromPromise.js');

// Modifiers
const split = require('split2');
const pipeline = require('./modifiers/pipeline.js');
const through = require('through2');
const filter = require('./modifiers/filter.js');
const map = require('./modifiers/map.js');
const reduce = require('./modifiers/reduce.js');
const parse = require('./modifiers/parse.js');
const stringify = require('./modifiers/stringify.js');
const pick = require('./modifiers/pick.js');
const intersperse = require('./modifiers/intersperse.js');
const where = require('./modifiers/where.js');
const sort = require('./modifiers/sort.js');
const pluck = require('./modifiers/pluck.js');
const find = require('./modifiers/find.js');
const findWhere = require('./modifiers/findWhere.js');
const drop = require('./modifiers/drop.js');
const take = require('./modifiers/take.js');
const batch = require('./modifiers/batch.js');
const flatten = require('./modifiers/flatten.js');

// Consumers
module.exports.wait = v2Wait;

// Creators
module.exports.fromArray = fromArray;
module.exports.fromCallback = fromCallback;
module.exports.fromPromise = fromPromise;

// Modifiers
module.exports.pipeline = pipeline;
module.exports.filter = filter;
module.exports.map = map;
module.exports.reduce = reduce;
module.exports.parse = parse;
module.exports.stringify = stringify;
module.exports.pick = pick;
module.exports.intersperse = intersperse;
module.exports.where = where;
module.exports.sort = sort;
module.exports.pluck = pluck;
module.exports.find = find;
module.exports.findWhere = findWhere;
module.exports.drop = drop;
module.exports.take = take;
module.exports.batch = batch;
module.exports.flatten = flatten;

/**
 * Returns a stream that has been split on new lines (by default). This is a
 * wrapper of {@link https://www.npmjs.com/package/split2|split2} by
 * {@link https://github.com/mcollina|mcollina}.
 *
 * @method
 * @static
 * @since    1.0.0
 * @category Util
 *
 * @param   {RegExp|String} [matcher] - A regular expression or string to split
 *                                      the stream by. The characters that match
 *                                      this regular expression are removed.
 * @returns {Stream}                  - Transform stream.
 */
module.exports.split = split;

/**
 * Returns a transform stream with a simple API. This is a wrapper of
 * {@link https://www.npmjs.com/package/through2|through2} by
 * {@link https://github.com/rvagg|rvagg}.
 *
 * @method   through
 * @static
 * @since    1.0.0
 * @category Util
 *
 * @param   {Object}   [options]   - Optional and passed directly to `stream.Transform`.
 * @param   {Function} [transform] - A function that takes a stream chunk, encoding and callback
 *                                   to transform the data in a stream. Additional items can
 *                                   be appended to the stream by calling `this.push(chunk)`.
 * @param   {Function} [flush]     - A function called at the end of the stream that can be
 *                                   used to finish up any processing. Additional items can be
 *                                   appended to the stream by calling `this.push(chunk)`.
 * @returns {Stream}               - Transform stream.
 */

/**
 * Returns a transform stream (in object mode) with a simple API. This is a wrapper of
 * {@link https://www.npmjs.com/package/through2|through2} by
 * {@link https://github.com/rvagg|rvagg}.
 *
 * @method   through.obj
 * @static
 * @since    1.0.0
 * @category Util
 *
 * @param   {Object}   [options]   - Optional and passed directly to `stream.Transform`.
 * @param   {Function} [transform] - A function that takes a stream chunk, encoding and callback
 *                                   to transform the data in a stream. Additional items can
 *                                   be appended to the stream by calling `this.push(chunk)`.
 * @param   {Function} [flush]     - A function called at the end of the stream that can be
 *                                   used to finish up any processing. Additional items can be
 *                                   appended to the stream by calling `this.push(chunk)`.
 * @returns {Stream}               - Transform stream.
 */
module.exports.through = through;
