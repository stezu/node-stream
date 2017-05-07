var selectVersion = require('./consumers/selectVersion.js');

// v1 Consumers
var v1First = require('./consumers/v1/first.js');
var v1ForEach = require('./consumers/v1/forEach.js');
var v1Wait = require('./consumers/v1/wait.js');

// v2 Consumers
var v2Wait = require('./consumers/v2/wait.js');

// Creators
var fromArray = require('./creators/fromArray.js');
var fromCallback = require('./creators/fromCallback.js');
var fromPromise = require('./creators/fromPromise.js');

// Modifiers
var split = require('split2');
var pipeline = require('./modifiers/pipeline.js');
var through = require('through2');
var filter = require('./modifiers/filter.js');
var map = require('./modifiers/map.js');
var reduce = require('./modifiers/reduce.js');
var parse = require('./modifiers/parse.js');
var stringify = require('./modifiers/stringify.js');
var pick = require('./modifiers/pick.js');
var intersperse = require('./modifiers/intersperse.js');
var where = require('./modifiers/where.js');
var sort = require('./modifiers/sort.js');
var pluck = require('./modifiers/pluck.js');
var find = require('./modifiers/find.js');
var findWhere = require('./modifiers/findWhere.js');
var drop = require('./modifiers/drop.js');
var take = require('./modifiers/take.js');
var batch = require('./modifiers/batch.js');
var flatten = require('./modifiers/flatten.js');

// Consumers
module.exports.first = v1First;
module.exports.forEach = v1ForEach;
module.exports.wait = selectVersion(v1Wait, v2Wait);
module.exports.wait.obj = selectVersion(v1Wait.obj, v2Wait.obj);
module.exports.wait.json = selectVersion(v1Wait.json, v2Wait.json);

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
