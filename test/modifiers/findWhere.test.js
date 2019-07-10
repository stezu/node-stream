const expect = require('chai').expect;

const getReadableStream = require('../_testHelpers/getReadableStream.js');
const runBasicStreamTests = require('../_testHelpers/runBasicStreamTests.js');
const findWhere = require('../../').findWhere;

describe('[findWhere]', () => {
  const data = ['panama', false, {
    name: 'Blake',
    age: 5
  }, {
    not: 'valid'
  }, {
    name: 'Glen',
    age: 30
  }, {
    name: 'Bob',
    age: 30
  }];

  function runTest(stream, objectMode, done) {
    const expected = [{
      name: 'Glen',
      age: 30
    }];
    const actual = [];

    stream
      .pipe(findWhere({ age: 30 }))
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

  it('emits an error if the passed in argument is not an object', (done) => {
    const readableStream = getReadableStream(data, {
      objectMode: true
    });

    readableStream
      .pipe(findWhere('age'))
      .on('error', (err) => {
        expect(err).to.be.an.instanceof(TypeError);
        expect(err.message).to.equal('Expected `query` to be an object.');

        done();
      })
      .on('end', () => {
        done(new Error('end should not be called'));
      })
      .resume();
  });
});
