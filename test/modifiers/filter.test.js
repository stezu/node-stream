
const _ = require('lodash');
const expect = require('chai').expect;

const getReadableStream = require('../_testHelpers/getReadableStream.js');
const runBasicStreamTests = require('../_testHelpers/runBasicStreamTests.js');
const filter = require('../../').filter;

describe('[filter]', () => {
  const data = ['item1', new Buffer('item2'), 'item3', '', 'item4'];
  const objData = [true, false, [1, 2, 3], 'string', 0, '11', 95.23, { obj: true }, _.noop];

  function runTest(stream, objectMode, done) {
    const expected = ['item1', 'item2', 'item3', 'item4'];
    const objExpected = [true, [1, 2, 3], 'string', '11', 95.23, { obj: true }, _.noop];
    const actual = [];

    stream
      .pipe(filter((chunk, next) => {
        next(null, chunk);
      }))
      .on('data', (chunk) => {
        actual.push(chunk);
      })
      .on('error', done)
      .on('end', () => {

        if (objectMode) {
          expect(actual).to.deep.equal(objExpected);
        } else {
          expect(actual.map((chunk) => chunk.toString())).to.deep.equal(expected);
        }

        done();
      });
  }

  runBasicStreamTests(data, objData, runTest);

  it('stops streaming if an error is passed', (done) => {
    const readableStream = getReadableStream(data);
    const returnedError = new Error('error handling test');

    readableStream
      .pipe(filter((chunk, next) => {
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

  it('drops data if the callback is called without arguments', (done) => {
    const readableStream = getReadableStream(data);
    let i = 0;

    readableStream
      .pipe(filter((chunk, next) => {

        // only emit the first item of the stream
        if (i === 0) {
          return next(null, chunk);
        }

        return next();
      }))
      .on('data', () => {
        i += 1;
      })
      .on('error', done)
      .on('end', () => {
        expect(i).to.equal(1);

        done();
      });
  });

  it('uses truthiness to determine if the item should stay or go', (done) => {
    const testData = [1, 2, 3, 4, 5, 6, 7, 8];
    const actual = [];
    const readableStream = getReadableStream(testData, {
      objectMode: true
    });

    readableStream
      .pipe(filter((chunk, next) => {
        const even = chunk % 2 === 0;

        next(null, even ? 1 : 0);
      }))
      .on('data', (chunk) => {
        actual.push(chunk);
      })
      .on('error', done)
      .on('end', () => {
        expect(actual).to.deep.equal([2, 4, 6, 8]);

        done();
      });
  });

  it('works with a sync condition', (done) => {
    const readableStream = getReadableStream(['mary', 'had', new Buffer('a'), 'little', 'lamb']);
    const expected = ['mary', 'had', 'little', 'lamb'];
    const actual = [];

    readableStream
      .pipe(filter((chunk) => chunk.length > 2))
      .on('error', () => {
        done(new Error('error should not be called'));
      })
      .on('data', (chunk) => {
        expect(chunk).to.be.an.instanceof(Buffer);

        actual.push(chunk.toString());
      })
      .on('end', () => {
        expect(actual).to.deep.equal(expected);

        done();
      });
  });

  it('works with a sync condition on an object stream', (done) => {
    const readableStream = getReadableStream([true, {}, [], 4, 'stringything'], {
      objectMode: true
    });
    const expected = [{}, []];
    const actual = [];

    readableStream
      .pipe(filter((chunk) => typeof chunk === 'object'))
      .on('error', () => {
        done(new Error('error should not be called'));
      })
      .on('data', (chunk) => {
        actual.push(chunk);
      })
      .on('end', () => {
        expect(actual).to.deep.equal(expected);

        done();
      });
  });

  it('works as a sync condition when the function has 0 arguments', (done) => {
    const readableStream = getReadableStream(['mary', 'had', new Buffer('a'), 'little', 'lamb']);
    const expected = ['a', 'little', 'lamb'];
    const actual = [];
    let i = 0;

    readableStream
      .pipe(filter(() => {
        i += 1;

        return i > 2;
      }))
      .on('error', () => {
        done(new Error('error should not be called'));
      })
      .on('data', (chunk) => {
        expect(chunk).to.be.an.instanceof(Buffer);

        actual.push(chunk.toString());
      })
      .on('end', () => {
        expect(actual).to.deep.equal(expected);

        done();
      });
  });

  it('works as an async condition when the function has more than the expected arguments', (done) => {
    const readableStream = getReadableStream(['mary', 'had', new Buffer('a'), 'little', 'lamb']);
    const expected = ['a', 'little', 'lamb'];
    const actual = [];
    let i = 0;

    readableStream
      .pipe(filter((chunk, next, banana, apple) => {

        if (typeof banana !== 'undefined' && typeof apple !== 'undefined') {
          done(new Error('this test was expecting only two valid arguments'));
        }

        i += 1;

        return next(null, i > 2);
      }))
      .on('error', () => {
        done(new Error('error should not be called'));
      })
      .on('data', (chunk) => {
        expect(chunk).to.be.an.instanceof(Buffer);

        actual.push(chunk.toString());
      })
      .on('end', () => {
        expect(actual).to.deep.equal(expected);

        done();
      });
  });
});
