var _ = require('lodash');
var expect = require('chai').expect;

var getReadableStream = require('../_utilities/getReadableStream.js');
var runBasicStreamTests = require('../_utilities/runBasicStreamTests.js');
var reduce = require('../../').reduce;

describe('[reduce]', function () {
  var data = ['item1', new Buffer('item2'), 'item3', 'item4'];
  var objData = [true, false, [1, 2, 3], 'string', '11', 95.23, { obj: true }, _.noop];
  var expected = ['4'];
  var objExpected = [8];

  function runTest(stream, objectMode, done) {
    var actual = [];

    stream
      .pipe(reduce(function (memo, chunk, next) {

        if (objectMode) {
          return next(null, memo + 1);
        }

        return next(null, (parseFloat(memo) + 1).toString());
      }, 0))
      .on('data', function (chunk) {
        actual.push(chunk);
      })
      .on('error', done)
      .on('end', function () {

        if (objectMode) {
          expect(actual).to.deep.equal(objExpected);
        } else {
          expect(actual).to.deep.equal(expected);
        }

        done();
      });
  }

  runBasicStreamTests(data, objData, runTest);

  it('stops streaming if an error is passed', function (done) {
    var readableStream = getReadableStream(data);
    var returnedError = new Error('error handling test');

    readableStream
      .pipe(reduce(function (memo, chunk, next) {
        next(returnedError);
      }))
      .on('error', function (err) {
        expect(err).to.equal(returnedError);
        done();
      })
      .on('end', function () {
        throw new Error('end should not be called');
      })
      .resume();
  });
});
