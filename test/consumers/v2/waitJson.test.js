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
    var actual = [];

    stream
      .pipe(waitJson())
      .on('data', function (chunk) {
        actual.push(chunk);
      })
      .on('error', done)
      .on('end', function () {
        expect(actual).to.have.lengthOf(1);

        expect(actual[0]).to.deep.equal(JSON.parse(Buffer.concat(data.map(function (item) {
          return new Buffer(item);
        }))));

        done();
      });
  }

  runBasicStreamTests(data, data, runTest);

  it('returns an error for invalid JSON on a Readable stream', function (done) {
    var readableStream = getReadableStream(data.slice(0, -1).concat([',{"non":"json}', ']']));

    readableStream
      .pipe(waitJson())
      .on('error', function (err) {
        expect(err).to.be.an.instanceof(Error);
        expect(err.message).to.match(/^Unexpected end of(?: JSON)? input$/);

        done();
      })
      .on('end', function () {
        throw new Error('end should not be called');
      })
      .resume();
  });

  it('returns an error for invalid JSON on a Duplex stream', function (done) {
    var duplexStream = getDuplexStream(data.slice(0, -1).concat([',{"non":"json}', ']']));

    duplexStream
      .pipe(waitJson())
      .on('error', function (err) {
        expect(err).to.be.an.instanceof(Error);
        expect(err.message).to.match(/^Unexpected end of(?: JSON)? input$/);

        done();
      })
      .on('end', function () {
        throw new Error('end should not be called');
      })
      .resume();
  });

  it('optionally provides data to a callback', function (done) {
    var stream = getReadableStream(data);
    var actual = {
      callback: [],
      event: []
    };
    var doneCount = 0;

    function onDone() {
      doneCount += 1;

      if (doneCount >= 2) {
        expect(actual.callback).to.have.lengthOf(1);
        expect(actual.event).to.have.lengthOf(1);

        // If they're both the same we have succeeded
        expect(actual.callback).to.deep.equal(actual.event);

        expect(actual.callback[0]).to.deep.equal(JSON.parse(Buffer.concat(data.map(function (item) {
          return new Buffer(item);
        }))));

        done();
      }
    }

    stream
      .pipe(waitJson(function (err, chunk) {
        expect(err).to.equal(null);
        actual.callback.push(chunk);

        onDone();
      }))
      .on('data', function (chunk) {
        actual.event.push(chunk);
      })
      .on('error', done)
      .on('end', onDone);
  });
});
