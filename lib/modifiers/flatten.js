var _ = require('lodash');
var through = require('through2');

function flatten() {
  return through.obj(function Transform(data, enc, cb) {
    var self = this;

    if (!_.isArray(data)) {
      return cb(null, data);
    }

    data.forEach(function (val) {
      self.push(val);
    });

    cb();
  });
}

module.exports = flatten;
