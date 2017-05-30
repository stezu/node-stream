var fs = require('fs');
var _ = require('lodash');

// Determine if the given stream is a filesystem stream
function isFS(stream) {

  if (!fs) {
    return false; // browser
  }

  return (stream instanceof fs.ReadStream || stream instanceof fs.WriteStream) && _.isFunction(stream.close);
}

// Determine of the given stream is a request
function isRequest(stream) {
  return stream.setHeader && _.isFunction(stream.abort);
}

// End a given stream by detecting its type and calling the appropriate method. This chunk of code is taken
// from pump: https://github.com/mafintosh/pump/blob/0a8fc2af6bcba91a93fc45bd7175acce4f761017/index.js#L40-L43
module.exports = function endStream(stream) {

  if (isFS(stream)) {
    stream.close(); // use close for fs streams to avoid fd leaks
  } else if (isRequest(stream)) {
    stream.abort(); // request.destroy just do .end - .abort is what we want
  } else if (_.isFunction(stream.destroy)) {
    stream.destroy();
  }
};
