var expect = require('chai').expect;

var getReadableStream = require('../_utilities/getReadableStream.js');
var getDuplexStream = require('../_utilities/getDuplexStream.js');
var runBasicStreamTests = require('../_utilities/runBasicStreamTests.js');
var stringify = require('../../').stringify;
var parse = require('../../').parse;

describe('[stringify]', function () {
  var data = ['str', true, { a: 'b' }];
  var expected = ['"str"', 'true', '{"a":"b"}'];

  function runTest(stream, objectMode, done) {
    var actual = [];

    stream
      .pipe(stringify())
      .on('data', function (chunk) {
        actual.push(chunk);
      })
      .on('error', done)
      .on('end', function () {
        expect(actual).to.deep.equal(expected);

        done();
      });
  }

  runBasicStreamTests(null, data, runTest);

  it('emits an error for circular references on a Readable stream', function (done) {
    var readableStream;
    var addlData = {};

    addlData.circ = addlData;

    readableStream = getReadableStream(data.concat([addlData]), {
      objectMode: true
    });

    readableStream
      .pipe(stringify())
      .on('error', function (err) {
        expect(err).to.be.an.instanceof(Error);
        expect(err.message).to.match(/^Converting circular structure to JSON$/);

        done();
      })
      .on('end', function () {
        done(new Error('end should not be called'));
      })
      .resume();
  });

  it('emits an error for circular references on a Duplex stream', function (done) {
    var duplexStream;
    var addlData = {};

    addlData.circ = addlData;

    duplexStream = getDuplexStream(data.concat([addlData]), {
      objectMode: true
    });

    duplexStream
      .pipe(stringify())
      .on('error', function (err) {
        expect(err).to.be.an.instanceof(Error);
        expect(err.message).to.match(/^Converting circular structure to JSON$/);

        done();
      })
      .on('end', function () {
        done(new Error('end should not be called'));
      })
      .resume();
  });

  it('can be parsed and strinigified multiple times without fail', function (done) {
    var readableStream = getReadableStream(data, {
      objectMode: true
    });
    var finalData = [];

    readableStream
      .pipe(stringify())
      .pipe(parse())
      .pipe(stringify())
      .pipe(parse())
      .pipe(stringify())
      .pipe(parse())
      .on('data', function (chunk) {
        finalData.push(chunk);
      })
      .on('end', function () {
        expect(finalData).to.deep.equal(data);

        done();
      });
  });
});
