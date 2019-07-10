const _ = require('lodash');
const expect = require('chai').expect;

const getReadableStream = require('../_testHelpers/getReadableStream.js');
const runBasicStreamTests = require('../_testHelpers/runBasicStreamTests.js');
const map = require('../../').map;

describe('[map]', () => {
  const data = ['item1', new Buffer('item2'), 'item3', 'item4'];
  const objData = [true, false, [1, 2, 3], 'string', '11', 95.23, { obj: true }, _.noop];

  function duplicateLastCharacter(chunk) {
    const str = chunk.toString();
    const last = str[str.length - 1];

    return str + last;
  }

  function runTest(stream, objectMode, done) {
    const expected = ['item11', 'item22', 'item33', 'item44'];
    const objExpected = ['boolean', 'boolean', 'object', 'string', 'string', 'number', 'object', 'function'];
    const actual = [];

    stream
      .pipe(map((chunk, next) => {

        if (objectMode) {
          return next(null, typeof chunk);
        }

        return next(null, duplicateLastCharacter(chunk));
      }))
      .on('data', (chunk) => {
        actual.push(chunk.toString());
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
      .pipe(map((chunk, next) => {
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
      .pipe(map((chunk, next) => {

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

  it('works with a sync transformer', (done) => {
    const readableStream = getReadableStream(['mary', 'had', new Buffer('a'), 'little', 'lamb']);
    const expected = ['mary ', 'had ', 'a ', 'little ', 'lamb '];
    const actual = [];

    readableStream
      .pipe(map((chunk) => `${chunk} `))
      .on('error', () => {
        done(new Error('error should not be called'));
      })
      .on('data', (chunk) => {
        expect(chunk).to.be.a('string');

        actual.push(chunk);
      })
      .on('end', () => {
        expect(actual).to.deep.equal(expected);

        done();
      });
  });

  it('works with a sync transformer on an object stream', (done) => {
    const readableStream = getReadableStream([true, {}, [], 4, 'stringything'], {
      objectMode: true
    });
    const expected = ['boolean', 'object', 'object', 'number', 'string'];
    const actual = [];

    readableStream
      .pipe(map((chunk) => typeof chunk))
      .on('error', () => {
        done(new Error('error should not be called'));
      })
      .on('data', (chunk) => {
        expect(chunk).to.be.a('string');

        actual.push(chunk);
      })
      .on('end', () => {
        expect(actual).to.deep.equal(expected);

        done();
      });
  });

  it('works as a sync transformer when the function has 0 arguments', (done) => {
    const readableStream = getReadableStream(['mary', 'had', new Buffer('a'), 'little', 'lamb']);
    const expected = ['a', 'a', 'a', 'a', 'a'];
    const actual = [];

    readableStream
      .pipe(map(() => 'a'))
      .on('error', () => {
        done(new Error('error should not be called'));
      })
      .on('data', (chunk) => {
        expect(chunk).to.be.a('string');

        actual.push(chunk);
      })
      .on('end', () => {
        expect(actual).to.deep.equal(expected);

        done();
      });
  });

  it('works as an async transformer when the function has more than the expected arguments', (done) => {
    const readableStream = getReadableStream(['mary', 'had', new Buffer('a'), 'little', 'lamb']);
    const expected = ['mary ', 'had ', 'a ', 'little ', 'lamb '];
    const actual = [];

    readableStream
      .pipe(map((chunk, next, banana, apple) => {

        if (typeof banana !== 'undefined' && typeof apple !== 'undefined') {
          done(new Error('this test was expecting only two valid arguments'));
        }

        return next(null, `${chunk} `);
      }))
      .on('error', () => {
        done(new Error('error should not be called'));
      })
      .on('data', (chunk) => {
        expect(chunk).to.be.a('string');

        actual.push(chunk.toString());
      })
      .on('end', () => {
        expect(actual).to.deep.equal(expected);

        done();
      });
  });
});
