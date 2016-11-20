var _ = require('lodash');
var expect = require('chai').expect;

var getReadableStream = require('../_utilities/getReadableStream.js');
var runBasicStreamTests = require('../_utilities/runBasicStreamTests.js');
var drop = require('../../').drop;

describe('[drop]', function () {
  var data = ['item1', new Buffer('item2'), 'item3', 'item4'];
  var objData = [true, false, [1, 2, 3], 'string', 0, '11', 95.23, { obj: true }, _.noop];
  var expected = [new Buffer('item3'), new Buffer('item4')];
  var objExpected = [[1, 2, 3], 'string', 0, '11', 95.23, { obj: true }, _.noop];

  function runTest(stream, objectMode, done) {
    var actual = [];

    stream
      .pipe(drop(2))
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

  it('emits an error if `n` is not an integer', function (done) {
    var readableStream = getReadableStream(data);

    readableStream
      .pipe(drop(false))
      .on('error', function (err) {
        expect(err).to.be.an.instanceof(TypeError);
        expect(err.message).to.equal('Expected `n` to be an integer.');

        done();
      })
      .on('end', function () {
        throw new Error('end should not be called');
      })
      .resume();
  });
});
