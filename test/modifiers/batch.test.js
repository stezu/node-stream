var expect = require('chai').expect;
var sinon = require('sinon');
var _ = require('lodash');
var through = require('through2');

var getReadableStream = require('../_utilities/getReadableStream.js');
var runBasicStreamTests = require('../_utilities/runBasicStreamTests.js');

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
    var expected = [[buff('item1')], [buff('item2'), buff('item3'), buff('item4')]];
    var objExpected = [
      objData.slice(0, 1),
      objData.slice(1)
    ];

    basicTests({ time: 5 }, expected, objExpected);

    it('combines data written during an interval into one write', function (done) {
      var clock = sinon.useFakeTimers(Date.now());
      var actual = [];
      var input = through.obj();

      input
        .pipe(batch({ time: 5 }))
        .on('data', function (chunk) {
          actual.push(chunk);
        })
        .on('error', done)
        .on('end', function () {
          expect(actual).to.deep.equal([[1], [2, 3], [4, 5]]);

          done();
        });

      input.write(1);

      clock.tick(1);

      input.write(2);
      input.write(3);

      clock.tick(6);

      input.write(4);
      input.write(5);

      input.end();

      clock.restore();
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
    function asyncWrite(stream, dataArr) {
      var clock = sinon.useFakeTimers(Date.now());

      dataArr.forEach(function (val) {
        stream.push(val);

        clock.tick(1);
      });

      clock.restore();

      stream.end();
    }

    it('writes chunks if count is met first before the defined time', function (done) {
      var input = through.obj();
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

      asyncWrite(input, _.times(CHUNKS));
    });

    it('writes chunks if time is met first before the defined count', function (done) {
      var input = through.obj();
      var CHUNKS = 10;
      // 10 / 2 + 1, since the first write is synchronous
      var EXPECTED = 6;
      var reads = 0;

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

      asyncWrite(input, _.times(CHUNKS));
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

  ['string', null, [1, 2, 3], 42].forEach(function (val) {
    describe('when invalid value ' + JSON.stringify(val) + ' is used as options', function () {
      it('works with the default options', function (done) {
        runSimpleTest(val, done);
      });
    });
  });

});
