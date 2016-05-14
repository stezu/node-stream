/* jshint node:true */

var structure = require('./_utilities/structure.js');
var waitJson = require('../index.js').wait.json;
var data = ['[', '{"item1":"json"}', ',{"item2":"json"}', ',{"item3":"json"}', ']'];

module.exports = structure(data, {
    test: function(done) {
        waitJson(this.stream, done);
    }
});
