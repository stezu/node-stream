var selectVersion = require('./consumers/selectVersion.js');

// v1 Consumers
var v1First = require('./consumers/v1/first.js');
var v1ForEach = require('./consumers/v1/forEach.js');
var v1Wait = require('./consumers/v1/wait.js');

// v2 Consumers
var v2First = require('./consumers/v2/first.js');
var v2ForEach = require('./consumers/v2/forEach.js');
var v2Wait = require('./consumers/v2/wait.js');

// Modifiers
var split = require('split2');
var pipeline = require('stream-combiner2');
var through = require('through2');
var filter = require('./modifiers/filter.js');
var map = require('./modifiers/map.js');
var reduce = require('./modifiers/reduce.js');

// Consumers
module.exports.first = selectVersion(v1First, v2First);
module.exports.first.obj = selectVersion(v1First.obj, v2First.obj);
module.exports.first.json = selectVersion(v1First.json, v2First.json);
module.exports.forEach = selectVersion(v1ForEach, v2ForEach);
module.exports.forEach.obj = selectVersion(v1ForEach.obj, v2ForEach.obj);
module.exports.forEach.json = selectVersion(v1ForEach.json, v2ForEach.json);
module.exports.wait = selectVersion(v1Wait, v2Wait);
module.exports.wait.obj = selectVersion(v1Wait.obj, v2Wait.obj);
module.exports.wait.json = selectVersion(v1Wait.json, v2Wait.json);

// Modifiers
module.exports.split = split;
module.exports.pipeline = pipeline;
module.exports.through = through;
module.exports.filter = filter;
module.exports.map = map;
module.exports.reduce = reduce;
