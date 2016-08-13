var expect = require('chai').expect;

var getReadableStream = require('../_utilities/getReadableStream.js');
var getDuplexStream = require('../_utilities/getDuplexStream.js');
var waitJson = require('../../lib/v1/waitJson.js');

describe('[v1-waitJson]', function() {
  var data = [
    '[',
    '{"json":"test"}',
    new Buffer(',{"item":"json"}'),
    ',{"item1":"item2"}',
    ']'
  ];

  function runTest(stream, done) {

    function onEnd(err, content) {
      expect(arguments).to.have.length(2);

      expect(err).to.equal(null);

      expect(content).to.be.an('array');
      expect(content).to.deep.equal(JSON.parse(Buffer.concat(data.map(function(item) {
        return new Buffer(item);
      }))));

      done();
    }

    waitJson(stream, onEnd);
  }

  it('waits for a Readable stream', function(done) {
    var readableStream = getReadableStream(data);

    runTest(readableStream, done);
  });

  it('waits for a Readable object stream', function(done) {
    var readableStream = getReadableStream(data, {
      objectMode: true
    });

    runTest(readableStream, done);
  });

  it('returns an error for a Readable stream', function(done) {
    var readableStream = getReadableStream(data.concat([12]));

    waitJson(readableStream, function(err) {
      expect(arguments).to.have.length(1);
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.equal('Invalid non-string/buffer chunk');
      done();
    });
  });

  it('returns an error for invalid JSON on a Readable stream', function(done) {
    var readableStream = getReadableStream(data.slice(0, -1).concat([',{"non":"json}', ']']));

    waitJson(readableStream, function(err) {
      expect(arguments).to.have.length(1);
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.match(/^Unexpected end of(?: JSON)? input$/);
      done();
    });
  });

  it('waits for a Duplex stream', function(done) {
    var duplexStream = getDuplexStream(data);

    runTest(duplexStream, done);
  });

  it('waits for a Duplex object stream', function(done) {
    var duplexStream = getDuplexStream(data, {
      objectMode: true
    });

    runTest(duplexStream, done);
  });

  it('returns an error for a Duplex stream', function(done) {
    var duplexStream = getDuplexStream(data.concat([12]));

    waitJson(duplexStream, function(err) {
      expect(arguments).to.have.length(1);
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.equal('Invalid non-string/buffer chunk');
      done();
    });
  });

  it('returns an error for invalid JSON on a Duplex stream', function(done) {
    var duplexStream = getDuplexStream(data.slice(0, -1).concat([',{"non":"json}', ']']));

    waitJson(duplexStream, function(err) {
      expect(arguments).to.have.length(1);
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.match(/^Unexpected end of(?: JSON)? input$/);
      done();
    });
  });
});
