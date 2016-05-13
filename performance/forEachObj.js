/* jshint node:true */

var stream = require('stream');
var _ = require('lodash');
var forEachObj = require('../index.js').forEach.obj;
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
    test: function(done) {
        var self = this;

        forEachObj(getReadableStream(), _.noop, done);
    }
};
