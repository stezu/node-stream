/* jshint node:true */

var _ = require('lodash');

var getReadableStream = require('./getReadableStream.js');

function structure(data, methods) {

    return _.merge({
        beforeEach: function(done) {
            this.stream = getReadableStream(data);
            done();
        }
    }, methods);
}

module.exports = structure;
