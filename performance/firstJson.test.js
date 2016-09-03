var structure = require('./_utilities/structure.js');
var firstJson = require('../').first.json;
var data = [
  '{"json":"test"}',
  new Buffer('{"item":"json"}'),
  '{"item1":"item2"}',
];

module.exports = structure(data, {
  test: function(done) {
    firstJson(this.stream, done);
  }
});
