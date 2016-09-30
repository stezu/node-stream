var expect = require('chai').expect;

var getReadableStream = require('../_utilities/getReadableStream.js');
var getDuplexStream = require('../_utilities/getDuplexStream.js');
var waitJson = require('../../').wait.json;

describe('[v2-waitJson]', function () {
  var data = [
    '[',
    '{"json":"test"}',
    new Buffer(',{"item":"json"}'),
    ',{"item1":"item2"}',
    ']'
  ];

  function runTest(stream, done) {
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

  it('waits for a Readable stream', function (done) {
    var readableStream = getReadableStream(data);

    runTest(readableStream, done);
  });

  it('waits for a Readable object stream', function (done) {
    var readableStream = getReadableStream(data, {
      objectMode: true
    });

    runTest(readableStream, done);
  });

  it('returns an error for invalid JSON on a Readable stream', function (done) {
    var readableStream = getReadableStream(data.slice(0, -1).concat([',{"non":"json}', ']']));

    readableStream.pipe(waitJson(function (err) {
      expect(arguments).to.have.lengthOf(1);
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.match(/^Unexpected end of(?: JSON)? input$/);
      done();
    }).resume());
  });

  it('waits for a Duplex stream', function (done) {
    var duplexStream = getDuplexStream(data);

    runTest(duplexStream, done);
  });

  it('waits for a Duplex object stream', function (done) {
    var duplexStream = getDuplexStream(data, {
      objectMode: true
    });

    runTest(duplexStream, done);
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
