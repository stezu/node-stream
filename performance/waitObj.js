/* jshint node:true */

var getReadableStream = require('./_utilities/getReadableStream.js');
var waitObj = require('../index.js').wait.obj;
var data = ['item1', 'item2', 'item3', 'item4'];

module.exports = {
    beforeEach: function(done) {
        this.stream = getReadableStream(data);
        done();
    },
    test: function(done) {
        waitObj(this.stream, done);
    }
};
