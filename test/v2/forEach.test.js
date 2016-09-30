var expect = require('chai').expect;

var getReadableStream = require('../_utilities/getReadableStream.js');
var getDuplexStream = require('../_utilities/getDuplexStream.js');
var forEach = require('../../').forEach;

describe('[v2-forEach]', function () {
  var data = ['item1', new Buffer('item2'), 'item3', 'item4'];

  function runTest(stream, done) {
    var idx = 0;

    function onData(chunk) {
      expect(chunk).to.be.an.instanceof(Buffer);
      expect(chunk).to.deep.equal(new Buffer(data[idx]));
    }

    function onEnd() {
      expect(arguments).to.have.lengthOf(0);
      expect(idx).to.equal(data.length);
    }

    stream
      .pipe(forEach(onData, onEnd))
      .on('data', function (chunk) {
        expect(chunk.toString()).to.equal(data[idx].toString());

        idx += 1;
      })
      .on('error', done)
      .on('end', function () {
        expect(data).to.have.lengthOf(idx);
        done();
      });
  }

  it('iterates through a Readable stream', function (done) {
    var readableStream = getReadableStream(data);

    runTest(readableStream, done);
  });

  it('iterates through a Readable object stream', function (done) {
    var readableStream = getReadableStream(data, {
      objectMode: true
    });

    runTest(readableStream, done);
  });

  it('iterates through a Duplex stream', function (done) {
    var duplexStream = getDuplexStream(data);

    runTest(duplexStream, done);
  });

  it('iterates through a Duplex object stream', function (done) {
    var duplexStream = getDuplexStream(data, {
      objectMode: true
    });

    runTest(duplexStream, done);
  });
});
