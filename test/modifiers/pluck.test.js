

const expect = require('chai').expect;

const getReadableStream = require('../_testHelpers/getReadableStream.js');
const runBasicStreamTests = require('../_testHelpers/runBasicStreamTests.js');
const pluck = require('../../').pluck;

describe('[pluck]', () => {
  const data = [{
    name: 'bill',
    age: '24'
  }, {
    name: 'pam'
  }, {
    age: 12
  }];

  function runTest(stream, objectMode, done) {
    const expected = ['24', 12];
    const actual = [];

    stream
      .pipe(pluck('age'))
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

  it('emits an error if the passed in argument is not a string or number', (done) => {
    const readableStream = getReadableStream(data, {
      objectMode: true
    });

    readableStream
      .pipe(pluck(true))
      .on('error', (err) => {
        expect(err).to.be.an.instanceof(TypeError);
        expect(err.message).to.equal('Expected `property` to be a string or a number.');

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
    const expected = [['c', 'd'], { c: ['d'] }];
    const actual = [];

    readableStream
      .pipe(pluck('a.b'))
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
