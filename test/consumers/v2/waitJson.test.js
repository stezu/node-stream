var expect = require('chai').expect;

var getReadableStream = require('../../_utilities/getReadableStream.js');
var getDuplexStream = require('../../_utilities/getDuplexStream.js');
var runBasicStreamTests = require('../../_utilities/runBasicStreamTests.js');
var waitJson = require('../../../').wait.json;

describe('[v2-waitJson]', function () {
  var data = [
    '[',
    '{"json":"test"}',
    new Buffer(',{"item":"json"}'),
    ',{"item1":"item2"}',
    ']'
  ];

  function runTest(stream, objectMode, done) {
    var idx = 0;

    function onEnd(err, content) {
      expect(arguments).to.have.lengthOf(2);

      expect(err).to.equal(null);

      expect(content).to.be.an('array');
      expect(content).to.deep.equal(JSON.parse(Buffer.concat(data.map(function (item) {
        return new Buffer(item);
      }))));
    }

    stream
      .pipe(waitJson(onEnd))
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

  runBasicStreamTests(data, data, runTest);

  it('returns an error for invalid JSON on a Readable stream', function (done) {
    var readableStream = getReadableStream(data.slice(0, -1).concat([',{"non":"json}', ']']));

    readableStream.pipe(waitJson(function (err) {
      expect(arguments).to.have.lengthOf(1);
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.match(/^Unexpected end of(?: JSON)? input$/);
      done();
    }).resume());
  });

  it('returns an error for invalid JSON on a Duplex stream', function (done) {
    var duplexStream = getDuplexStream(data.slice(0, -1).concat([',{"non":"json}', ']']));

    duplexStream.pipe(waitJson(function (err) {
      expect(arguments).to.have.lengthOf(1);
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.match(/^Unexpected end of(?: JSON)? input$/);
      done();
    }).resume());
  });
});
