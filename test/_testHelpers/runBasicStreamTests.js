var getReadableStream = require('./getReadableStream.js');
var getDuplexStream = require('./getDuplexStream.js');

function runBasicStreamTests(data, objData, runTest) {

  if (data) {

    it('works with a Readable stream', function (done) {
      var readableStream = getReadableStream(data);

      runTest(readableStream, false, done);
    });
  }

  it('works with a Readable object stream', function (done) {
    var readableStream = getReadableStream(objData, {
      objectMode: true
    });

    runTest(readableStream, true, done);
  });

  if (data) {

    it('works with a Duplex stream', function (done) {
      var duplexStream = getDuplexStream(data);

      runTest(duplexStream, false, done);
    });
  }

  it('works with a Duplex object stream', function (done) {
    var duplexStream = getDuplexStream(objData, {
      objectMode: true
    });

    runTest(duplexStream, true, done);
  });
}

module.exports = runBasicStreamTests;
