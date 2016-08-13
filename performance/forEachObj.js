var _ = require('lodash');

var structure = require('./_utilities/structure.js');
var forEachObj = require('../index.js').forEach.obj;
var data = ['item1', 'item2', 'item3', 'item4'];

module.exports = structure(data, {
  test: function(done) {
    forEachObj(this.stream, _.noop, done);
  }
});
