var expect = require('chai').expect;

var getReadableStream = require('../../_testHelpers/getReadableStream.js');
var getDuplexStream = require('../../_testHelpers/getDuplexStream.js');
var runBasicStreamTests = require('../../_testHelpers/runBasicStreamTests.js');
var wait = require('../../../').wait;

describe('[v1-wait]', function () {
  var data = ['item1', new Buffer('item2'), 'item3', 'item4'];

  function runTest(stream, objectMode, done) {

    function onEnd(err, content) {
      expect(arguments).to.have.lengthOf(2);

      expect(err).to.equal(null);

      expect(content).to.be.an.instanceof(Buffer);
      expect(content).to.deep.equal(Buffer.concat(data.map(function (item) {
        return new Buffer(item);
      })));

      done();
    }

    wait(stream, onEnd);
  }

  runBasicStreamTests(data, data, runTest);

  it('returns an error for a Readable stream', function (done) {
    var readableStream = getReadableStream(data.concat([12]));

    wait(readableStream, function (err) {
      expect(arguments).to.have.lengthOf(1);
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.be.oneOf([
        'Invalid non-string/buffer chunk',
        'The "chunk" argument must be one of type string, Buffer, or Uint8Array'
      ]);
      done();
    });
  });

  it('returns an error for a Duplex stream', function (done) {
    var duplexStream = getDuplexStream(data.concat([12]));

    wait(duplexStream, function (err) {
      expect(arguments).to.have.lengthOf(1);
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.be.oneOf([
        'Invalid non-string/buffer chunk',
        'The "chunk" argument must be one of type string, Buffer, or Uint8Array'
      ]);
      done();
    });
  });
});
