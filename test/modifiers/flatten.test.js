var expect = require('chai').expect;
var _ = require('lodash');

var runBasicStreamTests = require('../_utilities/runBasicStreamTests.js');

var flatten = require('../../').flatten;

function buff(str) {
  return new Buffer(str);
}

describe('[flatten]', function () {
  var data = ['item1', 'item2', 'item3'];
  var expected = data.map(buff);
  var objData = [{ a: 1}, [1, 2, 3], true, 'string', 42, _.noop];
  var objExpected = objData.reduce(function (memo, val) {
    return memo.concat(val);
  }, []);

  function runTest(stream, objectMode, done) {
    var actual = [];

    stream
      .pipe(flatten())
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
});
