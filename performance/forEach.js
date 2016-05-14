/* jshint node:true */

var _ = require('lodash');

var getReadableStream = require('./_utilities/getReadableStream.js');
var forEach = require('../index.js').forEach;
var data = ['item1', 'item2', 'item3', 'item4'];

module.exports = {
    beforeEach: function(done) {
        this.stream = getReadableStream(data);
        done();
    },
    test: function(done) {
        forEach(this.stream, _.noop, done);
    }
};
