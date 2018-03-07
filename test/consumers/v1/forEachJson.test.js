var _ = require('lodash');
var expect = require('chai').expect;

var getReadableStream = require('../../_testHelpers/getReadableStream.js');
var getDuplexStream = require('../../_testHelpers/getDuplexStream.js');
var runBasicStreamTests = require('../../_testHelpers/runBasicStreamTests.js');
var forEachJson = require('../../../').forEach.json;

describe('[v1-forEachJson]', function () {
  var data = [
    '{"json":"test"}',
    new Buffer('{"item":"json"}'),
    '{"item1":"item2"}'
  ];

  function runTest(stream, objectMode, done) {
    var idx = 0;

    function onData(chunk) {

      expect(chunk).to.be.an('object');
      expect(chunk).to.deep.equal(JSON.parse(data[idx]));

      idx += 1;
    }

    function onEnd() {
      expect(arguments).to.have.lengthOf(0);
      expect(idx).to.equal(data.length);

      done();
    }

    forEachJson(stream, onData, onEnd);
  }

  runBasicStreamTests(data, data, runTest);

  it('returns an error for a Readable stream', function (done) {
    var readableStream = getReadableStream(data.concat([12]));

    forEachJson(readableStream, _.noop, function (err) {
      expect(arguments).to.have.lengthOf(1);
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.be.oneOf([
        'Invalid non-string/buffer chunk',
        'The "chunk" argument must be one of type string, Buffer, or Uint8Array'
      ]);
      done();
    });
  });

  it('returns an error for invalid JSON on a Readable stream', function (done) {
    var readableStream = getReadableStream(data.concat(['{"non":"json}']));

    forEachJson(readableStream, _.noop, function (err) {
      expect(arguments).to.have.lengthOf(1);
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.match(/^Unexpected end of(?: JSON)? input$/);
      done();
    });
  });

  it('returns an error for a Duplex stream', function (done) {
    var duplexStream = getDuplexStream(data.concat([12]));

    forEachJson(duplexStream, _.noop, function (err) {
      expect(arguments).to.have.lengthOf(1);
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.be.oneOf([
        'Invalid non-string/buffer chunk',
        'The "chunk" argument must be one of type string, Buffer, or Uint8Array'
      ]);
      done();
    });
  });

  it('returns an error for a invalid JSON on a Duplex stream', function (done) {
    var duplexStream = getDuplexStream(data.concat(['{"non":"json}']));

    forEachJson(duplexStream, _.noop, function (err) {
      expect(arguments).to.have.lengthOf(1);
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.match(/^Unexpected end of(?: JSON)? input$/);
      done();
    });
  });
});
