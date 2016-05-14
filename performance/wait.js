/* jshint node:true */

var getReadableStream = require('./_utilities/getReadableStream.js');
var wait = require('../index.js').wait;
var data = ['item1', 'item2', 'item3', 'item4'];

module.exports = {
    beforeEach: function(done) {
        this.stream = getReadableStream(data);
        done();
    },
    test: function(done) {
        wait(this.stream, done);
    }
};
