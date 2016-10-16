var util = require('util');
var path = require('path');

var through = require('through2');
var _ = require('lodash');
var docdown = require('docdown');

var pkg = require('../package.json');
var version = pkg.version;

function getRelativePath(filePath) {
  return (filePath.replace(process.cwd() + '/', ''));
}

function replaceFileExtension(filePath, newExtension) {
  var parsedPath = path.parse(filePath);
  var pathWithoutExtension = path.join(parsedPath.root, parsedPath.dir, parsedPath.name);

  return (pathWithoutExtension + newExtension);
}

function buildDocs() {
  var options = {
    title: util.format('<a href="https://npmjs.com/package/node-stream">node-stream</a> <span>v%s</span>', version),
    toc: 'categories',
    style: 'github'
  };

  return through.obj(function (file, enc, next) {
    var relativePath = getRelativePath(file.path);
    var settings = _.extend({
      path: file.path,
      url: util.format('https://github.com/stezu/node-stream/blob/%s/%s', version, relativePath)
    }, options);

    // replace file contents with markdown
    file.contents = new Buffer(docdown(settings));

    // replace file extension
    file.path = replaceFileExtension(file.path, '.md');

    next(null, file);
  });
}

module.exports = buildDocs;
