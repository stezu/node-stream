var util = require('util');
var exec = require('child_process').exec;

var _ = require('lodash');
var nodeStream = require('../');

function optionsToArgs(options) {

  return _.map(options, function (val, key) {
    return util.format('--%s %s', key, val);
  });
}

function buildDocs() {
  var options = {
    destination: './docs/',
    template: './node_modules/minami'
  };

  return nodeStream.pipeline.obj(
    nodeStream.reduce(function (filepaths, file, next) {

      if (!file || !file.path) {
        return next(new Error('received an invalid file'));
      }

      filepaths.push(file.path);

      return next(null, filepaths);
    }, []),
    nodeStream.map(function (filepaths, next) {
      var opts = optionsToArgs(options);
      var args = [filepaths.join(' ')].concat(opts);

      return exec(util.format('./node_modules/.bin/jsdoc %s', args.join(' ')), function (err, stdout, stderr) {

        if (err) {
          return next(err);
        }

        if (stderr) {
          console.error(stderr.toString());
        }

        if (stdout) {
          console.log(stdout.toString());
        }

        return next();
      });
    })
  );
}

module.exports = buildDocs;
