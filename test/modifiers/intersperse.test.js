var expect = require('chai').expect;

var runBasicStreamTests = require('../_testHelpers/runBasicStreamTests.js');
var intersperse = require('../../').intersperse;

describe('[intersperse]', function () {
  var data = ['banana', 'apple', 'orange'];
  var dataObj = [true, true, true];

  function runTest(stream, objectMode, done) {
    var expected = ['banana', '\n', 'apple', '\n', 'orange'];
    var expectedObj = [true, false, true, false, true];
    var actual = [];

    stream
      .pipe(intersperse(objectMode ? false : '\n'))
      .on('data', function (chunk) {

        if (Buffer.isBuffer(chunk)) {
          actual.push(chunk.toString());
        } else {
          actual.push(chunk);
        }
      })
      .on('error', done)
      .on('end', function () {

        if (objectMode) {
          expect(actual).to.deep.equal(expectedObj);
        } else {
          expect(actual).to.deep.equal(expected);
        }

        done();
      });
  }

  runBasicStreamTests(data, dataObj, runTest);
});
