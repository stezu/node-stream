var split = require('split');

var first = require('./v1/first.js');
var firstObj = require('./v1/firstObj.js');
var firstJson = require('./v1/firstJson.js');

var forEach = require('./v1/forEach.js');
var forEachObj = require('./v1/forEachObj.js');
var forEachJson = require('./v1/forEachJson.js');

var wait = require('./v1/wait.js');
var waitObj = require('./v1/waitObj.js');
var waitJson = require('./v1/waitJson.js');

first.obj = firstObj;
first.json = firstJson;

forEach.obj = forEachObj;
forEach.json = forEachJson;

wait.obj = waitObj;
wait.json = waitJson;

module.exports = {
  split: split,
  first: first,
  forEach: forEach,
  wait: wait
};
