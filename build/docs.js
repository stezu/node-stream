var util = require('util');
var path = require('path');
var exec = require('child_process').exec;

var _ = require('lodash');
var nodeStream = require('../');

/**
 * Convert an object of options into an array of command line argument strings.
 *
 * @private
 * @param   {Object} options - Object to transtorm into the array of strings.
 * @returns {Array}          - Array of command line argument strings.
 */
function optionsToArgs(options) {

  return _.map(options, function (val, key) {
    return util.format('--%s %s', key, val);
  });
}

/**
 * Build documentation as part of a gulp task.
 *
 * @private
 * @returns {Stream} - Transform stream
 */
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

      var bin = path.resolve('.', 'node_modules/.bin/jsdoc');

      return exec(util.format('"%s" %s', bin, args.join(' ')), function (err, stdout, stderr) {

        if (err) {
          return next(err);
        }

        if (stderr) {
          process.stderr.write(stderr.toString());
        }

        if (stdout) {
          process.stdout.write(stdout.toString());
        }

        return next();
      });
    })
  );
}

module.exports = buildDocs;
