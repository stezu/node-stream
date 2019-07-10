const expect = require('chai').expect;

const runBasicStreamTests = require('../_testHelpers/runBasicStreamTests.js');
const intersperse = require('../../').intersperse;

describe('[intersperse]', () => {
  const data = ['banana', 'apple', 'orange'];
  const dataObj = [true, true, true];

  function runTest(stream, objectMode, done) {
    const expected = ['banana', '\n', 'apple', '\n', 'orange'];
    const expectedObj = [true, false, true, false, true];
    const actual = [];

    stream
      .pipe(intersperse(objectMode ? false : '\n'))
      .on('data', (chunk) => {

        if (Buffer.isBuffer(chunk)) {
          actual.push(chunk.toString());
        } else {
          actual.push(chunk);
        }
      })
      .on('error', done)
      .on('end', () => {

        if (objectMode) {
          expect(actual).to.deep.equal(expectedObj);
        } else {
          expect(actual).to.deep.equal(expected);
        }

        done();
      });
  }

  runBasicStreamTests(data, dataObj, runTest);
});
