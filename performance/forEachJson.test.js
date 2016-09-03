var _ = require('lodash');

var structure = require('./_utilities/structure.js');
var forEachJson = require('../').forEach.json;
var data = [
  '{"json":"test"}',
  new Buffer('{"item":"json"}'),
  '{"item1":"item2"}'
];

module.exports = structure(data, {
  test: function(done) {
    forEachJson(this.stream, _.noop, done);
  }
});
