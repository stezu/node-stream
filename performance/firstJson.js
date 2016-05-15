/* jshint node:true */

var structure = require('./_utilities/structure.js');
var firstJson = require('../index.js').first.json;
var data = ['[', '{"item1":"json"}', ',{"item2":"json"}', ',{"item3":"json"}', ']'];

module.exports = structure(data, {
    test: function(done) {
        firstJson(this.stream, done);
    }
});
