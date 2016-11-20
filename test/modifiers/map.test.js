var _ = require('lodash');
var expect = require('chai').expect;

var getReadableStream = require('../_utilities/getReadableStream.js');
var runBasicStreamTests = require('../_utilities/runBasicStreamTests.js');
var map = require('../../').map;

describe('[map]', function () {
  var data = ['item1', new Buffer('item2'), 'item3', 'item4'];
  var objData = [true, false, [1, 2, 3], 'string', '11', 95.23, { obj: true }, _.noop];
  var expected = ['item11', 'item22', 'item33', 'item44'];
  var objExpected = ['boolean', 'boolean', 'object', 'string', 'string', 'number', 'object', 'function'];

  function duplicateLastCharacter(chunk) {
    var str = chunk.toString();
    var last = str[str.length - 1];

    return str + last;
  }

  function runTest(stream, objectMode, done) {
    var actual = [];

    stream
      .pipe(map(function (chunk, next) {

        if (objectMode) {
          return next(null, typeof chunk);
        }

        return next(null, duplicateLastCharacter(chunk));
      }))
      .on('data', function (chunk) {
        actual.push(chunk.toString());
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
      .pipe(map(function (chunk, next) {
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
      .pipe(map(function (chunk, next) {

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
});