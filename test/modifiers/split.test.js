

const expect = require('chai').expect;

const getReadableStream = require('../_testHelpers/getReadableStream.js');
const runBasicStreamTests = require('../_testHelpers/runBasicStreamTests.js');
const split = require('../../').split;

describe('[split]', () => {
  const data = ['it\nem1', new Buffer('item2'), 'item3\n', 'i\ntem4'];
  const expected = ['it', 'em1item2item3', 'i', 'tem4'];

  function runTest(stream, objectMode, done) {
    const actual = [];

    stream
      .pipe(split())
      .on('data', (chunk) => {
        actual.push(chunk.toString());
      })
      .on('error', done)
      .on('end', () => {
        expect(actual).to.deep.equal(expected);
        done();
      });
  }

  runBasicStreamTests(data, data, runTest);

  it('accepts a regex matcher as the first argument', (done) => {
    const testData = ['mary had ', 'a lit', 'tle lamb who', 'se fleece was white ', 'as sn', 'ow'];
    const testExpected = ['mary', 'had', 'a', 'little', 'lamb', 'whose', 'fleece', 'was', 'white', 'as', 'snow'];
    const readableStream = getReadableStream(testData);
    const actual = [];

    readableStream
      .pipe(split(/\s+/))
      .on('data', (chunk) => {
        actual.push(chunk);
      })
      .on('error', done)
      .on('end', () => {
        expect(actual).to.deep.equal(testExpected);

        done();
      });
  });

  it('accepts a mapper as the first argument', (done) => {
    const testData = ['{"json": "parser"}\n{"parsing": "', 'json"}\n{"is', '":"fun"}\n'];
    const testExpected = [{ json: 'parser' }, { parsing: 'json' }, { is: 'fun'}];
    const readableStream = getReadableStream(testData);
    const actual = [];

    readableStream
      .pipe(split(JSON.parse))
      .on('data', (chunk) => {
        actual.push(chunk);
      })
      .on('error', done)
      .on('end', () => {
        expect(actual).to.deep.equal(testExpected);

        done();
      });
  });

  it('accepts both a string matcher and a mapper as arguments', (done) => {
    const testData = ['{"json": "parser"}banana{"parsing": "', 'json"}banana{"is', '":"fun"}'];
    const testExpected = [{ json: 'parser' }, { parsing: 'json' }, { is: 'fun'}];
    const readableStream = getReadableStream(testData);
    const actual = [];

    readableStream
      .pipe(split('banana', JSON.parse))
      .on('data', (chunk) => {
        actual.push(chunk);
      })
      .on('error', done)
      .on('end', () => {
        expect(actual).to.deep.equal(testExpected);

        done();
      });
  });
});
