/* jshint node:true */

var structure = require('./_utilities/structure.js');
var firstObj = require('../index.js').first.obj;
var data = ['item1', 'item2', 'item3', 'item4'];

module.exports = structure(data, {
    test: function(done) {
        firstObj(this.stream, done);
    }
});
