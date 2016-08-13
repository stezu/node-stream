var structure = require('./_utilities/structure.js');
var first = require('../index.js').first;
var data = ['item1', 'item2', 'item3', 'item4'];

module.exports = structure(data, {
  test: function(done) {
    first(this.stream, done);
  }
});
