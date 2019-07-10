

const expect = require('chai').expect;

const getReadableStream = require('../_testHelpers/getReadableStream.js');
const getDuplexStream = require('../_testHelpers/getDuplexStream.js');
const runBasicStreamTests = require('../_testHelpers/runBasicStreamTests.js');
const pick = require('../../').pick;

describe('[pick]', () => {
  const data = [{
    name: 'bill',
    age: '24'
  }, {
    name: 'pam'
  }, {
    age: 12
  }];

  function runTest(stream, objectMode, done) {
    const expected = [{
      age: '24'
    }, {}, {
      age: 12
    }];
    const actual = [];

    stream
      .pipe(pick('age'))
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

  it('emits an error for a non-object on a Readable stream', (done) => {
    const readableStream = getReadableStream(data.concat(['string']), {
      objectMode: true
    });

    readableStream
      .pipe(pick('age'))
      .on('error', (err) => {
        expect(err).to.be.an.instanceof(TypeError);
        expect(err.message).to.match(/^Expected object, got string$/);

        done();
      })
      .on('end', () => {
        done(new Error('end should not be called'));
      })
      .resume();
  });

  it('emits an error for a non-object on a Duplex stream', (done) => {
    const duplexStream = getDuplexStream(data.concat([true]), {
      objectMode: true
    });

    duplexStream
      .pipe(pick('age'))
      .on('error', (err) => {
        expect(err).to.be.an.instanceof(TypeError);
        expect(err.message).to.match(/^Expected object, got boolean$/);

        done();
      })
      .on('end', () => {
        done(new Error('end should not be called'));
      })
      .resume();
  });

  it('works with dot notation', (done) => {
    const readableStream = getReadableStream([{
      a: {
        b: ['c', 'd']
      },
      c: 'c'
    }, {
      a: {
        b: {
          c: ['d']
        },
        b1: false
      },
      b: true
    }], {
      objectMode: true
    });
    const expected = [{ a: { b: ['c', 'd'] } }, { a: { b: { c: ['d'] } } }];
    const actual = [];

    readableStream
      .pipe(pick('a.b'))
      .on('error', done)
      .on('data', (chunk) => {
        actual.push(chunk);
      })
      .on('end', () => {
        expect(actual).to.deep.equal(expected);

        done();
      });
  });

  it('can pick multiple properties at a time', (done) => {
    const readableStream = getReadableStream([{
      name: 'Pam',
      age: 24,
      location: 'Florida'
    }, {
      name: 'Bill',
      age: 26,
      location: 'Alabama'
    }, {
      name: 'Jessica',
      age: 32,
      location: 'California'
    }], {
      objectMode: true
    });
    const expected = [{
      name: 'Pam',
      age: 24
    }, {
      name: 'Bill',
      age: 26
    }, {
      name: 'Jessica',
      age: 32
    }];
    const actual = [];

    readableStream
      .pipe(pick('name', 'age'))
      .on('error', done)
      .on('data', (chunk) => {
        actual.push(chunk);
      })
      .on('end', () => {
        expect(actual).to.deep.equal(expected);

        done();
      });
  });
});
