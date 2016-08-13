var structure = require('./_utilities/structure.js');
var wait = require('../').wait;
var data = ['item1', 'item2', 'item3', 'item4'];

module.exports = structure(data, {
  test: function(done) {
    wait(this.stream, done);
  }
});
