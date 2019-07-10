

const expect = require('chai').expect;
const _ = require('lodash');

const runBasicStreamTests = require('../_testHelpers/runBasicStreamTests.js');
const getReadableStream = require('../_testHelpers/getReadableStream.js');

const flatten = require('../../').flatten;
const batch = require('../../').batch;

function buff(str) {
  return new Buffer(str);
}

describe('[flatten]', () => {
  (() => {
    const data = ['item1', 'item2', 'item3'];
    const expected = data.map(buff);
    const objData = [{ a: 1}, [1, 2, 3], true, 'string', 42, _.noop];
    const objExpected = [{ a: 1}, 1, 2, 3, true, 'string', 42, _.noop];

    function runTest(stream, objectMode, done) {
      const actual = [];

      stream
        .pipe(flatten())
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
    }

    runBasicStreamTests(data, objData, runTest);
  })();

  it('emits all items in read arrays as individual items', (done) => {
    const count = 3;
    const actual = [];
    let flatCount = 0;
    let inputCount = 0;

    const input = getReadableStream([_.times(count)], {
      objectMode: true
    });

    input
      .on('data', () => {
        inputCount += 1;
      })
      .pipe(flatten())
      .on('data', (chunk) => {
        actual.push(chunk);
        flatCount += 1;
      })
      .on('error', done)
      .on('end', () => {
        expect(actual).to.deep.equal(_.times(count));
        expect(flatCount).to.equal(count);
        expect(inputCount).to.equal(1);

        done();
      });
  });

  it('passes through non-array items', (done) => {
    const count = 3;
    const actual = [];
    let flatCount = 0;
    let inputCount = 0;

    const input = getReadableStream(_.times(count), {
      objectMode: true
    });

    input
      .on('data', () => {
        inputCount += 1;
      })
      .pipe(flatten())
      .on('data', (chunk) => {
        actual.push(chunk);
        flatCount += 1;
      })
      .on('error', done)
      .on('end', () => {
        expect(actual).to.deep.equal(_.times(count));
        expect(flatCount).to.equal(count);
        expect(inputCount).to.equal(count);

        done();
      });
  });

  it('can handle large arrays', (done) => {
    const data = [
      _.times(50),
      _.times(70),
      _.times(90)
    ];
    const expected = data.reduce((memo, val) => memo.concat(val), []);

    const input = getReadableStream(data, {
      objectMode: true
    });

    const actual = [];

    input
      .pipe(flatten())
      .on('data', (chunk) => {
        actual.push(chunk);
      })
      .on('error', done)
      .on('end', () => {
        expect(actual).to.deep.equal(expected);

        done();
      });
  });

  it('reverses a batch stream', (done) => {
    const data = _.times(300);

    const input = getReadableStream(data, {
      objectMode: true
    });

    const actual = [];

    input
      .pipe(batch({ count: 23 }))
      .pipe(flatten())
      .on('data', (chunk) => {
        actual.push(chunk);
      })
      .on('error', done)
      .on('end', () => {
        expect(actual).to.deep.equal(data);

        done();
      });
  });
});
