var expect = require('chai').expect;
var _ = require('lodash');

var runBasicStreamTests = require('../_utilities/runBasicStreamTests.js');
var getReadableStream = require('../_utilities/getReadableStream.js');

var flatten = require('../../').flatten;
var batch = require('../../').batch;

function buff(str) {
  return new Buffer(str);
}

describe('[flatten]', function () {
  (function () {
    var data = ['item1', 'item2', 'item3'];
    var expected = data.map(buff);
    var objData = [{ a: 1}, [1, 2, 3], true, 'string', 42, _.noop];
    var objExpected = [{ a: 1}, 1, 2, 3, true, 'string', 42, _.noop];

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
  }());

  it('emits all items in read arrays as individual items', function (done) {
    var count = 3;
    var flatCount = 0;
    var inputCount = 0;
    var actual = [];

    var input = getReadableStream([_.times(count)], {
      objectMode: true
    });

    input
      .on('data', function () {
        inputCount += 1;
      })
      .pipe(flatten())
      .on('data', function (chunk) {
        actual.push(chunk);
        flatCount += 1;
      })
      .on('error', done)
      .on('end', function () {
        expect(actual).to.deep.equal(_.times(count));
        expect(flatCount).to.equal(count);
        expect(inputCount).to.equal(1);

        done();
      });
  });

  it('passes through non-array items', function (done) {
    var count = 3;
    var flatCount = 0;
    var inputCount = 0;
    var actual = [];

    var input = getReadableStream(_.times(count), {
      objectMode: true
    });

    input
      .on('data', function () {
        inputCount += 1;
      })
      .pipe(flatten())
      .on('data', function (chunk) {
        actual.push(chunk);
        flatCount += 1;
      })
      .on('error', done)
      .on('end', function () {
        expect(actual).to.deep.equal(_.times(count));
        expect(flatCount).to.equal(count);
        expect(inputCount).to.equal(count);

        done();
      });
  });

  it('can handle large arrays', function (done) {
    var data = [
      _.times(50),
      _.times(70),
      _.times(90)
    ];
    var expected = data.reduce(function (memo, val) {
      return memo.concat(val);
    }, []);

    var input = getReadableStream(data, {
      objectMode: true
    });

    var actual = [];

    input
      .pipe(flatten())
      .on('data', function (chunk) {
        actual.push(chunk);
      })
      .on('error', done)
      .on('end', function () {
        expect(actual).to.deep.equal(expected);

        done();
      });
  });

  it('reverses a batch stream', function (done) {
    var data = _.times(300);

    var input = getReadableStream(data, {
      objectMode: true
    });

    var actual = [];

    input
      .pipe(batch({ count: 23 }))
      .pipe(flatten())
      .on('data', function (chunk) {
        actual.push(chunk);
      })
      .on('error', done)
      .on('end', function () {
        expect(actual).to.deep.equal(data);

        done();
      });
  });
});
