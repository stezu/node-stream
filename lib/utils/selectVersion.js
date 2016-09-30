var stream = require('stream');

function selectVersion(v1, v2) {

  function versionSelector(firstParam) {

    // the v1 API took a stream as the first argument
    if (firstParam instanceof stream) {
      return v1.apply(v1, arguments);
    }

    // the v2 API returns a stream for piping
    return v2.apply(v2, arguments);
  }

  return versionSelector;
}

module.exports = selectVersion;
