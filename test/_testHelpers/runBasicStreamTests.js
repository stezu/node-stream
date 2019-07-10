const getReadableStream = require('./getReadableStream.js');
const getDuplexStream = require('./getDuplexStream.js');

function runBasicStreamTests(data, objData, runTest) {

  if (data) {

    it('works with a Readable stream', (done) => {
      const readableStream = getReadableStream(data);

      runTest(readableStream, false, done);
    });
  }

  it('works with a Readable object stream', (done) => {
    const readableStream = getReadableStream(objData, {
      objectMode: true
    });

    runTest(readableStream, true, done);
  });

  if (data) {

    it('works with a Duplex stream', (done) => {
      const duplexStream = getDuplexStream(data);

      runTest(duplexStream, false, done);
    });
  }

  it('works with a Duplex object stream', (done) => {
    const duplexStream = getDuplexStream(objData, {
      objectMode: true
    });

    runTest(duplexStream, true, done);
  });
}

module.exports = runBasicStreamTests;
