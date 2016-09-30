var _ = require('lodash');
var expect = require('chai').expect;

var getReadableStream = require('../_utilities/getReadableStream.js');
var getDuplexStream = require('../_utilities/getDuplexStream.js');
var forEachJson = require('../../').forEach.json;

describe('[v2-forEachJson]', function () {
  var data = [
    '{"json":"test"}',
    new Buffer('{"item":"json"}'),
    '{"item1":"item2"}'
  ];

  function runTest(stream, done) {
    var idx = 0;

    function onData(chunk) {
      expect(chunk).to.be.an('object');
      expect(chunk).to.deep.equal(JSON.parse(data[idx]));
    }

    function onEnd() {
      expect(arguments).to.have.lengthOf(0);
      expect(idx).to.equal(data.length);
    }

    stream
      .pipe(forEachJson(onData, onEnd))
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

  it('returns an error for invalid JSON on a Readable stream', function (done) {
    var readableStream = getReadableStream(data.concat(['{"non":"json}']));

    readableStream.pipe(forEachJson(_.noop, function (err) {
      expect(arguments).to.have.lengthOf(1);
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.match(/^Unexpected end of(?: JSON)? input$/);
      done();
    }).resume());
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

  it('returns an error for a invalid JSON on a Duplex stream', function (done) {
    var duplexStream = getDuplexStream(data.concat(['{"non":"json}']));

    duplexStream.pipe(forEachJson(_.noop, function (err) {
      expect(arguments).to.have.lengthOf(1);
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.match(/^Unexpected end of(?: JSON)? input$/);
      done();
    }).resume());
  });
});
