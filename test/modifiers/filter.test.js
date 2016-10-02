var _ = require('lodash');
var expect = require('chai').expect;

var getReadableStream = require('../_utilities/getReadableStream.js');
var runBasicStreamTests = require('../_utilities/runBasicStreamTests.js');
var filter = require('../../').filter;

describe('[filter]', function () {
  var data = ['item1', new Buffer('item2'), 'item3', '', 'item4'];
  var objData = [true, false, [1, 2, 3], 'string', 0, '11', 95.23, { obj: true }, _.noop];
  var expected = ['item1', 'item2', 'item3', 'item4'];
  var objExpected = [true, [1, 2, 3], 'string', '11', 95.23, { obj: true }, _.noop];

  function runTest(stream, objectMode, done) {
    var actual = [];

    stream
      .pipe(filter(function (chunk, next) {
        next(null, chunk);
      }))
      .on('data', function (chunk) {
        actual.push(chunk);
      })
      .on('error', done)
      .on('end', function () {

        if (objectMode) {
          expect(actual).to.deep.equal(objExpected);
        } else {
          expect(actual.map(function (chunk) {
            return chunk.toString();
          })).to.deep.equal(expected);
        }

        done();
      });
  }

  runBasicStreamTests(data, objData, runTest);

  it('stops streaming if an error is passed', function (done) {
    var readableStream = getReadableStream(data);
    var returnedError = new Error('error handling test');

    readableStream
      .pipe(filter(function (chunk, next) {
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

  it('drops data if the callback is called without arguments', function (done) {
    var readableStream = getReadableStream(data);
    var i = 0;

    readableStream
      .pipe(filter(function (chunk, next) {

        // only emit the first item of the stream
        if (i === 0) {
          return next(null, chunk);
        }

        return next();
      }))
      .on('data', function () {
        i += 1;
      })
      .on('error', done)
      .on('end', function () {
        expect(i).to.equal(1);

        done();
      });
  });

  it('uses truthiness to determine if the item should stay or go', function (done) {
    var testData = [1, 2, 3, 4, 5, 6, 7, 8];
    var actual = [];
    var readableStream = getReadableStream(testData, {
      objectMode: true
    });

    readableStream
      .pipe(filter(function (chunk, next) {
        var even = chunk % 2 === 0;

        next(null, even ? 1 : 0);
      }))
      .on('data', function (chunk) {
        actual.push(chunk);
      })
      .on('error', done)
      .on('end', function () {
        expect(actual).to.deep.equal([2, 4, 6, 8]);

        done();
      });
  });
});
