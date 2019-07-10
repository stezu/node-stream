

const _ = require('lodash');
const expect = require('chai').expect;

const getReadableStream = require('../_testHelpers/getReadableStream.js');
const runBasicStreamTests = require('../_testHelpers/runBasicStreamTests.js');
const reduce = require('../../').reduce;

describe('[reduce]', () => {
  const data = ['item1', new Buffer('item2'), 'item3', 'item4'];
  const objData = [true, false, [1, 2, 3], 'string', '11', 95.23, { obj: true }, _.noop];

  function runTest(stream, objectMode, done) {
    const expected = ['4'];
    const objExpected = [8];
    const actual = [];

    stream
      .pipe(reduce((memo, chunk, next) => {

        if (objectMode) {
          return next(null, memo + 1);
        }

        return next(null, (parseFloat(memo) + 1).toString());
      }, 0))
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

  it('stops streaming if an error is passed', (done) => {
    const readableStream = getReadableStream(data);
    const returnedError = new Error('error handling test');

    readableStream
      .pipe(reduce((memo, chunk, next) => {
        next(returnedError);
      }))
      .on('error', (err) => {
        expect(err).to.equal(returnedError);
        done();
      })
      .on('end', () => {
        done(new Error('end should not be called'));
      })
      .resume();
  });

  it('works with a sync reducer', (done) => {
    const readableStream = getReadableStream(['mary', 'had', new Buffer('a'), 'little', 'lamb']);
    const expected = 'maryhadalittlelamb';
    let actual = '';

    readableStream
      .pipe(reduce((memo, chunk) => memo + chunk, ''))
      .on('error', () => {
        done(new Error('error should not be called'));
      })
      .on('data', (chunk) => {
        expect(chunk).to.be.a('string');

        actual += chunk;
      })
      .on('end', () => {
        expect(actual).to.equal(expected);

        done();
      });
  });

  it('works with a sync reducer on an object stream', (done) => {
    const readableStream = getReadableStream([1, 5, 11, 4, 12], {
      objectMode: true
    });
    const expected = 33;
    let actual = 0;

    readableStream
      .pipe(reduce((memo, chunk) => memo + chunk, 0))
      .on('error', () => {
        done(new Error('error should not be called'));
      })
      .on('data', (chunk) => {
        expect(chunk).to.be.a('number');

        actual += chunk;
      })
      .on('end', () => {
        expect(actual).to.equal(expected);

        done();
      });
  });

  it('works as a sync reducer when the function has 0 arguments', (done) => {
    const readableStream = getReadableStream(['mary', 'had', new Buffer('a'), 'little', 'lamb']);
    const expected = 1;
    let actual = null;

    readableStream
      .pipe(reduce(() => 1, 0))
      .on('error', () => {
        done(new Error('error should not be called'));
      })
      .on('data', (chunk) => {

        if (actual === expected) {
          done(new Error('data should only be called once'));
        }

        expect(chunk).to.be.a('number');

        actual = chunk;
      })
      .on('end', () => {
        expect(actual).to.equal(expected);

        done();
      });
  });

  it('works as an async reducer when the function has more than the expected arguments', (done) => {
    const readableStream = getReadableStream(['mary', 'had', new Buffer('a'), 'little', 'lamb']);
    const expected = 'maryhadalittlelamb';
    let actual = '';

    readableStream
      .pipe(reduce((memo, chunk, next, apple) => {

        if (typeof apple !== 'undefined') {
          done(new Error('this test was expecting only three valid arguments'));
        }

        next(null, memo + chunk);
      }, ''))
      .on('error', () => {
        done(new Error('error should not be called'));
      })
      .on('data', (chunk) => {

        if (actual === expected) {
          done(new Error('data should only be called once'));
        }

        expect(chunk).to.be.a('string');

        actual = chunk;
      })
      .on('end', () => {
        expect(actual).to.equal(expected);

        done();
      });
  });
});
