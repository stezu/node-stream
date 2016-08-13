var structure = require('./_utilities/structure.js');
var waitJson = require('../index.js').wait.json;
var data = [
  '[',
  '{"json":"test"}',
  new Buffer(',{"item":"json"}'),
  ',{"item1":"item2"}',
  ']'
];

module.exports = structure(data, {
  test: function(done) {
    waitJson(this.stream, done);
  }
});
