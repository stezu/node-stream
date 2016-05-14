/* jshint node:true */

var _ = require('lodash');

var structure = require('./_utilities/structure.js');
var forEach = require('../index.js').forEach;
var data = ['item1', 'item2', 'item3', 'item4'];

module.exports = structure(data, {
    test: function(done) {
        forEach(this.stream, _.noop, done);
    }
});
