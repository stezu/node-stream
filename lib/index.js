var split = require('split2');

// v1 API
var v1First = require('./v1/first.js');
var v1ForEach = require('./v1/forEach.js');
var v1Wait = require('./v1/wait.js');

// v2 API
var v2First = require('./v2/first.js');
var v2ForEach = require('./v2/forEach.js');
var v2Wait = require('./v2/wait.js');

var selectVersion = require('./utils/selectVersion.js');

module.exports = {
  split: split,
  first: selectVersion(v1First, v2First),
  forEach: selectVersion(v1ForEach, v2ForEach),
  wait: selectVersion(v1Wait, v2Wait)
};

module.exports.first.obj = selectVersion(v1First.obj, v2First.obj);
module.exports.first.json = selectVersion(v1First.json, v2First.json);
module.exports.forEach.obj = selectVersion(v1ForEach.obj, v2ForEach.obj);
module.exports.forEach.json = selectVersion(v1ForEach.json, v2ForEach.json);
module.exports.wait.obj = selectVersion(v1Wait.obj, v2Wait.obj);
module.exports.wait.json = selectVersion(v1Wait.json, v2Wait.json);
