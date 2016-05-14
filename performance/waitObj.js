/* jshint node:true */

var structure = require('./_utilities/structure.js');
var waitObj = require('../index.js').wait.obj;
var data = ['item1', 'item2', 'item3', 'item4'];

module.exports = structure(data, {
    test: function(done) {
        waitObj(this.stream, done);
    }
});
