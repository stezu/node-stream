/* jshint node:true */

var forEach = require('./lib/forEach.js');
var forEachObj = require('./lib/forEachObj.js');
var forEachJson = require('./lib/forEachJson.js');

var wait = require('./lib/wait.js');
var waitObj = require('./lib/waitObj.js');
var waitJson = require('./lib/waitJson.js');

forEach.obj = forEachObj;
forEach.json = forEachJson;

wait.obj = waitObj;
wait.json = waitJson;

module.exports = {
    forEach: forEach,
    wait: wait
};
