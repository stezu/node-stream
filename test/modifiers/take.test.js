

const _ = require('lodash');
const expect = require('chai').expect;

const getReadableStream = require('../_testHelpers/getReadableStream.js');
const runBasicStreamTests = require('../_testHelpers/runBasicStreamTests.js');
const take = require('../../').take;

describe('[take]', () => {
  const data = ['item1', new Buffer('item2'), 'item3', 'item4'];
  const objData = [true, false, [1, 2, 3], 'string', 0, '11', 95.23, { obj: true }, _.noop];
  const expected = [new Buffer('item1'), new Buffer('item2')];
  const objExpected = [true, false];

  function runTest(stream, objectMode, done) {
    const actual = [];

    stream
      .pipe(take(2))
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

  it('emits an error if `n` is not an integer', (done) => {
    const readableStream = getReadableStream(data);

    readableStream
      .pipe(take(false))
      .on('error', (err) => {
        expect(err).to.be.an.instanceof(TypeError);
        expect(err.message).to.equal('Expected `n` to be an integer.');

        done();
      })
      .on('end', () => {
        done(new Error('end should not be called'));
      })
      .resume();
  });
});
