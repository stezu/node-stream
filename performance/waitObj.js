/* jshint node:true */

var stream = require('stream');
var waitObj = require('../index.js').wait.obj;
var data = ['item1', 'item2', 'item3', 'item4'];

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
        waitObj(this.stream, done);
    }
};
