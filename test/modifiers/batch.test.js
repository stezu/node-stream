const expect = require('chai').expect;
const _ = require('lodash');

const asyncStream = require('../_testHelpers/getFakeAsyncStream.js');
const getReadableStream = require('../_testHelpers/getReadableStream.js');
const runBasicStreamTests = require('../_testHelpers/runBasicStreamTests.js');

const batch = require('../../').batch;

function buff(str) {
  return new Buffer(str);
}

describe('[batch]', () => {
  const data = ['item1', new Buffer('item2'), 'item3', 'item4'];
  const objData = [true, false, [1, 2, 3], 'string', 0, '11', 95.23, { obj: true }, _.noop];

  function basicTests(batchOptions, expected, objExpected) {
    runBasicStreamTests(data, objData, (stream, objectMode, done) => {
      const actual = [];

      stream
        .pipe(batch(batchOptions))
        .on('data', (chunk) => {
          actual.push(chunk);
        })
        .on('error', done)
        .on('end', () => {
          if (objectMode) {
            expect(actual).to.deep.equal(objExpected);
          } else {
            expect(actual).to.deep.equal(expected);
          }

          done();
        });
    });

    it('writes all chunks as an array', (done) => {
      const input = getReadableStream([1, 2, 3], {
        objectMode: true
      });

      let chunksRead = false;

      input
        .pipe(batch(batchOptions))
        .on('data', (chunk) => {
          chunksRead = true;
          expect(chunk).to.be.an('array');
        })
        .on('error', done)
        .on('end', () => {
          expect(chunksRead).to.equal(true);
          done();
        });
    });

    it('successfully ends if there is no data written', (done) => {
      const input = getReadableStream([], {
        objectMode: true
      });

      let chunksRead = false;

      input
        .pipe(batch(batchOptions))
        .on('data', (chunk) => {
          chunksRead = true;
          expect(chunk).to.be.an('array');
        })
        .on('error', done)
        .on('end', () => {
          expect(chunksRead).to.equal(false);
          done();
        });
    });

  }

  describe('when "time" is defined in options', () => {
    const expected = [[buff('item1'), buff('item2'), buff('item3'), buff('item4')]];
    const objExpected = [objData];

    basicTests({ time: 5 }, expected, objExpected);

    it('combines data written during an interval into one write', (done) => {
      const actual = [];
      const input = asyncStream.readable(_.times(22), { objectMode: true });

      input
        .pipe(batch({ time: 4 }))
        .on('data', (chunk) => {
          actual.push(chunk);
        })
        .on('error', done)
        .on('end', () => {
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

  describe('when "count" is defined in options', () => {
    const expected = [[buff('item1'), buff('item2')], [buff('item3'), buff('item4')]];
    const tempObjData = [].concat(objData);
    const objExpected = [];

    while (tempObjData.length) {
      objExpected.push(tempObjData.splice(0, 2));
    }

    basicTests({ count: 2 }, expected, objExpected);

    it('emits chunks of the defined size', (done) => {
      const COUNT = 3;
      const CHUNKS = 5;

      const input = getReadableStream(_.times(CHUNKS * COUNT), {
        objectMode: true
      });

      let chunks = 0;

      input
        .pipe(batch({ count: COUNT }))
        .on('data', (chunk) => {
          chunks += 1;
          expect(chunk).to.be.an('array').and.to.have.lengthOf(COUNT);
        })
        .on('error', done)
        .on('end', () => {
          expect(chunks).to.equal(CHUNKS);
          done();
        });
    });

    it('emits any remaining elements when the stream ends', (done) => {
      const testData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      const expectedData = [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12]];

      const input = getReadableStream(testData, {
        objectMode: true
      });

      const actual = [];

      input
        .pipe(batch({ count: 5 }))
        .on('data', (chunk) => {
          actual.push(chunk);
        })
        .on('error', done)
        .on('end', () => {
          expect(actual).to.deep.equal(expectedData);
          done();
        });
    });
  });

  describe('when both "time" and "count" are defined in options', () => {
    it('writes chunks if count is met first before the defined time', (done) => {
      const input = asyncStream.readable(_.times(10), { objectMode: true });
      const CHUNKS = 10;
      let chunks = 0;

      input
        .pipe(batch({
          count: 1,
          time: 5000
        }))
        .on('data', (chunk) => {
          chunks += 1;
          expect(chunk).to.be.an('array').and.to.have.lengthOf(1);
        })
        .on('error', done)
        .on('end', () => {
          expect(chunks).to.equal(CHUNKS);
          done();
        });
    });

    it('writes chunks if time is met first before the defined count', (done) => {
      const CHUNKS = 10;
      const EXPECTED = 5;
      const input = asyncStream.readable(_.times(CHUNKS), { objectMode: true });
      let reads = 0;

      input
        .pipe(batch({
          count: 100,
          time: 2
        }))
        .on('data', (chunk) => {
          reads += 1;
          expect(chunk).to.be.an('array').and.to.have.length.above(0);
        })
        .on('error', done)
        .on('end', () => {
          expect(reads).to.equal(EXPECTED);
          done();
        });
    });

    it('successfully ends if there is no data written', (done) => {
      const input = getReadableStream([], {
        objectMode: true
      });

      let chunksRead = false;

      input
        .pipe(batch({
          count: 2,
          time: 1
        }))
        .on('data', (chunk) => {
          chunksRead = true;
          expect(chunk).to.be.an('array');
        })
        .on('error', done)
        .on('end', () => {
          expect(chunksRead).to.equal(false);
          done();
        });
    });
  });

  function runSimpleTest(opts, done) {
    const input = getReadableStream([1, 2, 3], {
      objectMode: true
    });

    const expected = [[1], [2], [3]];
    const actual = [];

    input
      .pipe(batch(opts))
      .on('data', (chunk) => {
        actual.push(chunk);
      })
      .on('error', done)
      .on('end', () => {
        expect(actual).to.deep.equal(expected);
        done();
      });
  }

  describe('when neither "time" nor "count" are defined in options', () => {
    const expected = data.map((val) => [buff(val)]);
    const objExpected = objData.map((val) => [val]);

    basicTests({}, expected, objExpected);

    it('writes chunks immediately when read', (done) => {
      runSimpleTest({}, done);
    });
  });

  describe('emits an error when', () => {
    function invalidOptions(options, constructor, errMessage) {
      return (done) => {
        const input = getReadableStream([1], {
          objectMode: true
        });

        input
          .pipe(batch(options))
          .on('data', _.noop)
          .on('error', (err) => {
            expect(err).to.be.instanceOf(constructor);
            expect(err.message).to.equal(errMessage);

            done();
          })
          .on('end', () => {
            done(new Error('done was not supposed to be called'));
          });
      };
    }

    function stringify(val) {
      return JSON.stringify(val) || typeof val;
    }

    ['string', [1, 2, 3], 42, _.noop].forEach((val) => {
      it(`options is the invalid value: ${stringify(val)}`, (done) => {
        invalidOptions(val, TypeError, 'Expected `options` to be an object or not defined.')(done);
      });
    });

    ['string', [1, 2, 3], {}, _.noop, -1].forEach((val) => {
      it(`options.time is the invalid value: ${stringify(val)}`, invalidOptions(
        { time: val },
        TypeError,
        'Expected `options.time` to be an integer that is 0 or greater.'
      ));
    });

    ['string', [1, 2, 3], {}, _.noop, 0, -1].forEach((val) => {
      it(`options.count is the invalid value: ${stringify(val)}`, invalidOptions(
        { count: val },
        TypeError,
        'Expected `options.count` to be an integer greater than 0.'
      ));
    });
  });

  describe('does not emit an error when', () => {

    function validOptionsTest(options) {
      return (done) => {
        const input = getReadableStream([1], {
          objectMode: true
        });

        input
          .pipe(batch(options))
          .on('data', _.noop)
          .on('error', done)
          .on('end', () => {
            done();
          });
      };
    }

    it('options are not provided', validOptionsTest());

    it('options is null', validOptionsTest(null));

    it('options is an empty object', validOptionsTest({}));

    it('options.time is set to undefined', validOptionsTest({ time: undefined }));

    it('options.count is set to undefined', validOptionsTest({ count: undefined }));
  });
});
