/* jshint node:true */

var getReadableStream = require('./_utilities/getReadableStream.js');
var waitJson = require('../index.js').wait.json;
var data = ['[', '{"item1":"json"}', ',{"item2":"json"}', ',{"item3":"json"}', ']'];

module.exports = {
    beforeEach: function(done) {
        this.stream = getReadableStream(data);
        done();
    },
    test: function(done) {
        waitJson(this.stream, done);
    }
};
