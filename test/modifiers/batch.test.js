var expect = require('chai').expect;
var _ = require('lodash');
var through = require('through2');

var getReadableStream = require('../_utilities/getReadableStream.js');
var runBasicStreamTests = require('../_utilities/runBasicStreamTests.js');

var batch = require('../../').batch;

function buff(str) {
  return new Buffer(str);
}

describe('[throttle]', function () {
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
      var actual = [];
      var input = through.obj();

      input
        .pipe(batch({ time: 1 }))
        .on('data', function (chunk) {
          actual.push(chunk);
        })
        .on('error', done)
        .on('end', function () {
          expect(actual).to.deep.equal([[1], [2, 3], [4, 5]]);

          done();
        });

      input.write(1);

      setTimeout(function () {
        input.write(2);
        input.write(3);
      }, 1);

      setTimeout(function () {
        input.write(4);
        input.write(5);

        input.end();
      }, 4);
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
  });

  describe('when both "time" and "count" are defined in options', function () {
    function asyncWrite(stream, dataArr) {
      if (dataArr.length) {
        setTimeout(function () {
          stream.push(dataArr[0]);

          asyncWrite(stream, dataArr.slice(1));
        }, 1);
      } else {
        stream.end();
      }
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
      var reads = 0;

      input
        .pipe(batch({
          count: 100,
          time: 1
        }))
        .on('data', function (chunk) {
          reads += 1;
          expect(chunk).to.be.an('array').and.to.have.length.above(0);
        })
        .on('error', done)
        .on('end', function () {
          // for good measure, leave some wiggle room as to
          // how many writes we expect, because timers
          expect(reads).to.be.above(CHUNKS / 2);
          done();
        });

      asyncWrite(input, _.times(10));
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

  describe('when neither "time" nor "count" are defined in options', function () {
    var expected = data.map(function (val) {
      return [buff(val)];
    });
    var objExpected = objData.map(function (val) {
      return [val];
    });

    basicTests(null, expected, objExpected);

    it('writes chunks immediately when read', function (done) {
      var DATA = _.times(5);
      var input = through.obj();
      var idx = 0;
      var chunksRead = false;

      function write() {
        input.push(DATA[idx]);
        idx += 1;
      }

      input
        .pipe(batch())
        .on('data', function (chunk) {
          chunksRead = true;
          expect(chunk).to.be.an('array');
          expect(chunk).to.deep.equal([DATA[idx]]);
        })
        .on('error', done)
        .on('end', function () {
          expect(chunksRead).to.equal(true);
          done();
        });

      while (idx < DATA.length) {
        write();
      }

      input.end();
    });
  });

});
