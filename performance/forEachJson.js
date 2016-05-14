/* jshint node:true */

var _ = require('lodash');

var structure = require('./_utilities/structure.js');
var forEachJson = require('../index.js').forEach.json;
var data = ['{"item1":"json"}', '{"item2":"json"}', '{"item3":"json"}'];

module.exports = structure(data, {
    test: function(done) {
        forEachJson(this.stream, _.noop, done);
    }
});
