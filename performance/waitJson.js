/* jshint node:true */

var stream = require('stream');
var waitJson = require('../index.js').wait.json;
var data = ['[', '{"item1":"json"}', ',{"item2":"json"}', ',{"item3":"json"}', ']'];

function getReadableStream() {
    var readableStream = new stream.Readable();

    readableStream._read = (function() {
        var d = data.slice().concat([12]);

        return function() {
            if (d.length > 0) {
                this.push(d.shift());
            } else {
                this.push(null);
            }
        };
    })();

    return readableStream;
}

module.exports = {
    beforeEach: function(done) {
        this.stream = getReadableStream();
        done();
    },
    test: function(done) {
        waitJson(this.stream, done);
    }
};
