var expect = require('chai').expect;
var _ = require('lodash');
var through = require('through2');

var getReadableStream = require('../_utilities/getReadableStream.js');
var runBasicStreamTests = require('../_utilities/runBasicStreamTests.js');

var throttle = require('../../').throttle;

function buff(str) {
  return new Buffer(str);
}

describe.only('[throttle]', function () {
  var data = ['item1', new Buffer('item2'), 'item3', '', 'item4'];
  var objData = [true, false, [1, 2, 3], 'string', 0, '11', 95.23, { obj: true }, _.noop];

  function basicTests(batchOptions, expected, objExpected) {
    runBasicStreamTests(data, objData, function (stream, objectMode, done) {
      var actual = [];

      stream
        .pipe(throttle(batchOptions))
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
        .pipe(throttle(batchOptions))
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
        .pipe(throttle(batchOptions))
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
        .pipe(throttle({ time: 1 }))
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
        .pipe(throttle({ count: COUNT }))
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
    it('writes chunks if count is met first before the defined time');

    it('writes chunks if time is met first before the defined count');

    it('successfully ends if there is no data written');
  });

  describe('when neither "time" nor "count" are defined in options', function () {
    it('writes chunks immediately when read');

    it('successfully ends if there is no data written');
  });

});
