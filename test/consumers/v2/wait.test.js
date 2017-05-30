var expect = require('chai').expect;
var _ = require('lodash');

var getReadableStream = require('../../_testHelpers/getReadableStream.js');
var runBasicStreamTests = require('../../_testHelpers/runBasicStreamTests.js');
var wait = require('../../../').wait;

describe('[v2-wait]', function () {
  var data = ['item1', new Buffer('item2'), 'item3', 'item4'];
  var expected = ['item1item2item3item4'];

  function runTest(stream, objectMode, done) {
    var actual = [];

    stream
      .pipe(wait())
      .on('data', function (chunk) {
        actual.push(chunk);
      })
      .on('error', done)
      .on('end', function () {
        expect(actual).to.have.lengthOf(1);

        expect(actual).to.deep.equal(expected.map(function (item) {
          return new Buffer(item);
        }));

        done();
      });
  }

  runBasicStreamTests(data, data, runTest);

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

        expect(actual.callback).to.deep.equal(expected.map(function (item) {
          return new Buffer(item);
        }));

        done();
      }
    }

    stream
      .pipe(wait(function (err, chunk) {
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

  it('reads the entire stream when given a callback', function (done) {
    var testData = _.times(100, String);
    var stream = getReadableStream(testData);

    stream
      .pipe(wait(function (err, chunk) {
        expect(err).to.equal(null);
        expect(chunk.toString()).to.equal(testData.join(''));

        done();
      }));
  });
});
