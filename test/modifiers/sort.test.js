

const expect = require('chai').expect;

const getReadableStream = require('../_testHelpers/getReadableStream.js');
const runBasicStreamTests = require('../_testHelpers/runBasicStreamTests.js');
const sort = require('../../').sort;

describe('[sort]', () => {
  const data = [12, 10, 9, 30, 5, 16];

  function runTest(stream, objectMode, done) {
    const expected = [10, 12, 16, 30, 5, 9];
    const actual = [];

    stream
      .pipe(sort())
      .on('data', (chunk) => {
        actual.push(chunk);
      })
      .on('error', done)
      .on('end', () => {
        expect(actual).to.deep.equal(expected);

        done();
      });
  }

  runBasicStreamTests(null, data, runTest);

  it('accepts a custom sorting method', (done) => {
    const readableStream = getReadableStream(data, {
      objectMode: true
    });
    const expected = [5, 9, 10, 12, 16, 30];
    const actual = [];

    readableStream
      .pipe(sort((a, b) => a - b))
      .on('error', done)
      .on('data', (chunk) => {
        actual.push(chunk);
      })
      .on('end', () => {
        expect(actual).to.deep.equal(expected);
        done();
      });
  });

  it('emits an error if the passed in argument is not a function', (done) => {
    const readableStream = getReadableStream(data, {
      objectMode: true
    });

    readableStream
      .pipe(sort('banana'))
      .on('error', (err) => {
        expect(err).to.be.an.instanceof(TypeError);
        expect(err.message).to.equal('Expected `compareFunction` to be a function.');

        done();
      })
      .on('end', () => {
        done(new Error('end should not be called'));
      })
      .resume();
  });
});
