var expect = require('chai').expect;
var _ = require('lodash');

var asyncStream = require('../_testHelpers/getFakeAsyncStream.js');
var getReadableStream = require('../_testHelpers/getReadableStream.js');
var runBasicStreamTests = require('../_testHelpers/runBasicStreamTests.js');

var batch = require('../../').batch;

function buff(str) {
  return new Buffer(str);
}

describe('[batch]', function () {
  var data = ['item1', new Buffer('item2'), 'item3', 'item4'];
  var objData = [true, false, [1, 2, 3], 'string', 0, '11', 95.23, { obj: true }, _.noop];

  function basicTests(batchOptions, expected, objExpected) {
    runBasicStreamTests(data, objData, function (stream, objectMode, done) {
      var actual = [];

      stream
        .pipe(batch(batchOptions))
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
    });

    it('writes all chunks as an array', function (done) {
      var input = getReadableStream([1, 2, 3], {
        objectMode: true
      });

      var chunksRead = false;

      input
        .pipe(batch(batchOptions))
        .on('data', function (chunk) {
          chunksRead = true;
          expect(chunk).to.be.an('array');
        })
        .on('error', done)
        .on('end', function () {
          expect(chunksRead).to.equal(true);
          done();
        });
    });

    it('successfully ends if there is no data written', function (done) {
      var input = getReadableStream([], {
        objectMode: true
      });

      var chunksRead = false;

      input
        .pipe(batch(batchOptions))
        .on('data', function (chunk) {
          chunksRead = true;
          expect(chunk).to.be.an('array');
        })
        .on('error', done)
        .on('end', function () {
          expect(chunksRead).to.equal(false);
          done();
        });
    });

  }

  describe('when "time" is defined in options', function () {
    var expected = [[buff('item1'), buff('item2'), buff('item3'), buff('item4')]];
    var objExpected = [objData];

    basicTests({ time: 5 }, expected, objExpected);

    it('combines data written during an interval into one write', function (done) {
      var actual = [];
      var input = asyncStream.readable(_.times(22), { objectMode: true });

      input
        .pipe(batch({ time: 4 }))
        .on('data', function (chunk) {
          actual.push(chunk);
        })
        .on('error', done)
        .on('end', function () {
          expect(actual).to.deep.equal([
            [0, 1, 2, 3],
            [4, 5, 6, 7],
            [8, 9, 10, 11],
            [12, 13, 14, 15],
            [16, 17, 18, 19],
            [20, 21]
          ]);

          done();
        });
    });
  });

  describe('when "count" is defined in options', function () {
    var expected = [[buff('item1'), buff('item2')], [buff('item3'), buff('item4')]];
    var tempObjData = [].concat(objData);
    var objExpected = [];

    while (tempObjData.length) {
      objExpected.push(tempObjData.splice(0, 2));
    }

    basicTests({ count: 2 }, expected, objExpected);

    it('emits chunks of the defined size', function (done) {
      var COUNT = 3;
      var CHUNKS = 5;

      var input = getReadableStream(_.times(CHUNKS * COUNT), {
        objectMode: true
      });

      var chunks = 0;

      input
        .pipe(batch({ count: COUNT }))
        .on('data', function (chunk) {
          chunks += 1;
          expect(chunk).to.be.an('array').and.to.have.lengthOf(COUNT);
        })
        .on('error', done)
        .on('end', function () {
          expect(chunks).to.equal(CHUNKS);
          done();
        });
    });

    it('emits any remaining elements when the stream ends', function (done) {
      var testData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      var expectedData = [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12]];

      var input = getReadableStream(testData, {
        objectMode: true
      });

      var actual = [];

      input
        .pipe(batch({ count: 5 }))
        .on('data', function (chunk) {
          actual.push(chunk);
        })
        .on('error', done)
        .on('end', function () {
          expect(actual).to.deep.equal(expectedData);
          done();
        });
    });
  });

  describe('when both "time" and "count" are defined in options', function () {
    it('writes chunks if count is met first before the defined time', function (done) {
      var input = asyncStream.readable(_.times(10), { objectMode: true });
      var chunks = 0;
      var CHUNKS = 10;

      input
        .pipe(batch({
          count: 1,
          time: 5000
        }))
        .on('data', function (chunk) {
          chunks += 1;
          expect(chunk).to.be.an('array').and.to.have.lengthOf(1);
        })
        .on('error', done)
        .on('end', function () {
          expect(chunks).to.equal(CHUNKS);
          done();
        });
    });

    it('writes chunks if time is met first before the defined count', function (done) {
      var CHUNKS = 10;
      var EXPECTED = 5;
      var reads = 0;
      var input = asyncStream.readable(_.times(CHUNKS), { objectMode: true });

      input
        .pipe(batch({
          count: 100,
          time: 2
        }))
        .on('data', function (chunk) {
          reads += 1;
          expect(chunk).to.be.an('array').and.to.have.length.above(0);
        })
        .on('error', done)
        .on('end', function () {
          expect(reads).to.equal(EXPECTED);
          done();
        });
    });

    it('successfully ends if there is no data written', function (done) {
      var input = getReadableStream([], {
        objectMode: true
      });

      var chunksRead = false;

      input
        .pipe(batch({
          count: 2,
          time: 1
        }))
        .on('data', function (chunk) {
          chunksRead = true;
          expect(chunk).to.be.an('array');
        })
        .on('error', done)
        .on('end', function () {
          expect(chunksRead).to.equal(false);
          done();
        });
    });
  });

  function runSimpleTest(opts, done) {
    var input = getReadableStream([1, 2, 3], {
      objectMode: true
    });

    var expected = [[1], [2], [3]];
    var actual = [];

    input
      .pipe(batch(opts))
      .on('data', function (chunk) {
        actual.push(chunk);
      })
      .on('error', done)
      .on('end', function () {
        expect(actual).to.deep.equal(expected);
        done();
      });
  }

  describe('when neither "time" nor "count" are defined in options', function () {
    var expected = data.map(function (val) {
      return [buff(val)];
    });
    var objExpected = objData.map(function (val) {
      return [val];
    });

    basicTests({}, expected, objExpected);

    it('writes chunks immediately when read', function (done) {
      runSimpleTest({}, done);
    });
  });

  describe('emits an error when', function () {
    function invalidOptions(options, constructor, errMessage) {
      return function (done) {
        var input = getReadableStream([1], {
          objectMode: true
        });

        input
          .pipe(batch(options))
          .on('data', _.noop)
          .on('error', function (err) {
            expect(err).to.be.instanceOf(constructor);
            expect(err.message).to.equal(errMessage);

            done();
          })
          .on('end', function () {
            done(new Error('done was not supposed to be called'));
          });
      };
    }

    function stringify(val) {
      return JSON.stringify(val) || typeof val;
    }

    ['string', [1, 2, 3], 42, _.noop].forEach(function (val) {
      it('options is the invalid value: ' + stringify(val), function (done) {
        invalidOptions(val, TypeError, 'Expected `options` to be an object or not defined.')(done);
      });
    });

    ['string', [1, 2, 3], {}, _.noop, -1].forEach(function (val) {
      it('options.time is the invalid value: ' + stringify(val), invalidOptions(
        { time: val },
        TypeError,
        'Expected `options.time` to be an integer that is 0 or greater.'
      ));
    });

    ['string', [1, 2, 3], {}, _.noop, 0, -1].forEach(function (val) {
      it('options.count is the invalid value: ' + stringify(val), invalidOptions(
        { count: val },
        TypeError,
        'Expected `options.count` to be an integer greater than 0.'
      ));
    });
  });

  describe('does not emit an error when', function () {
    var undef;

    function validOptionsTest(options) {
      return function (done) {
        var input = getReadableStream([1], {
          objectMode: true
        });

        input
          .pipe(batch(options))
          .on('data', _.noop)
          .on('error', done)
          .on('end', function () {
            done();
          });
      };
    }

    it('options are not provided', validOptionsTest());

    it('options is null', validOptionsTest(null));

    it('options is an empty object', validOptionsTest({}));

    it('options.time is set to undefined', validOptionsTest({ time: undef }));

    it('options.count is set to undefined', validOptionsTest({ count: undef }));
  });
});
