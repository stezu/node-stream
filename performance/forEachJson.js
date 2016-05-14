/* jshint node:true */

var _ = require('lodash');

var getReadableStream = require('./_utilities/getReadableStream.js');
var forEachJson = require('../index.js').forEach.json;
var data = ['{"item1":"json"}', '{"item2":"json"}', '{"item3":"json"}'];

module.exports = {
    beforeEach: function(done) {
        this.stream = getReadableStream(data);
        done();
    },
    test: function(done) {
        forEachJson(this.stream, _.noop, done);
    }
};
