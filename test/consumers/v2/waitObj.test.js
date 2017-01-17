var expect = require('chai').expect;
var _ = require('lodash');

var getReadableStream = require('../../_utilities/getReadableStream.js');
var runBasicStreamTests = require('../../_utilities/runBasicStreamTests.js');
var waitObj = require('../../../').wait.obj;

describe('[v2-waitObj]', function () {
  var data = ['item1', new Buffer('item2'), 'item3', 'item4'];
  var expected = ['item1', 'item2', 'item3', 'item4'];
  var objData = [true, 'item', 5, { obj: 'mode' }, [1, 2, 3]];

  function runTest(stream, objectMode, done) {
    var actual = [];

    stream
      .pipe(waitObj())
      .on('data', function (chunk) {
        actual.push(chunk);
      })
      .on('error', done)
      .on('end', function () {
        expect(actual).to.have.lengthOf(1);

        if (objectMode) {
          expect(actual[0]).to.deep.equal(objData);
        } else {
          expect(actual[0]).to.deep.equal(expected.map(function (item) {
            return new Buffer(item);
          }));
        }

        done();
      });
  }

  runBasicStreamTests(data, objData, runTest);

  it('optionally provides data to a callback', function (done) {
    var stream = getReadableStream(objData, {
      objectMode: true
    });
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

        expect(actual.callback[0]).to.deep.equal(objData);

        done();
      }
    }

    stream
      .pipe(waitObj(function (err, chunk) {
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
    var testData = _.times(100);
    var stream = getReadableStream(testData, {
      objectMode: true
    });

    stream
      .pipe(waitObj(function (err, chunk) {
        expect(err).to.equal(null);
        expect(chunk).to.deep.equal(testData);

        done();
      }));
  });
});
