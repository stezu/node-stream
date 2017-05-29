var expect = require('chai').expect;

var getReadableStream = require('../_utilities/getReadableStream.js');
var runBasicStreamTests = require('../_utilities/runBasicStreamTests.js');
var sort = require('../../').sort;

describe('[sort]', function () {
  var data = [12, 10, 9, 30, 5, 16];

  function runTest(stream, objectMode, done) {
    var expected = [10, 12, 16, 30, 5, 9];
    var actual = [];

    stream
      .pipe(sort())
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

  it('accepts a custom sorting method', function (done) {
    var readableStream = getReadableStream(data, {
      objectMode: true
    });
    var expected = [5, 9, 10, 12, 16, 30];
    var actual = [];

    readableStream
      .pipe(sort(function (a, b) {
        return a - b;
      }))
      .on('error', done)
      .on('data', function (chunk) {
        actual.push(chunk);
      })
      .on('end', function () {
        expect(actual).to.deep.equal(expected);
        done();
      });
  });

  it('emits an error if the passed in argument is not a function', function (done) {
    var readableStream = getReadableStream(data, {
      objectMode: true
    });

    readableStream
      .pipe(sort('banana'))
      .on('error', function (err) {
        expect(err).to.be.an.instanceof(TypeError);
        expect(err.message).to.equal('Expected `compareFunction` to be a function.');

        done();
      })
      .on('end', function () {
        done(new Error('end should not be called'));
      })
      .resume();
  });
});
