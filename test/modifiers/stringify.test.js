const expect = require('chai').expect;

const getReadableStream = require('../_testHelpers/getReadableStream.js');
const getDuplexStream = require('../_testHelpers/getDuplexStream.js');
const runBasicStreamTests = require('../_testHelpers/runBasicStreamTests.js');
const stringify = require('../../').stringify;
const parse = require('../../').parse;

describe('[stringify]', () => {
  const data = ['str', true, { a: 'b' }];
  const expected = ['"str"', 'true', '{"a":"b"}'];

  function runTest(stream, objectMode, done) {
    const actual = [];

    stream
      .pipe(stringify())
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

  it('emits an error for circular references on a Readable stream', (done) => {
    const addlData = {};

    addlData.circ = addlData;

    const readableStream = getReadableStream(data.concat([addlData]), {
      objectMode: true
    });

    readableStream
      .pipe(stringify())
      .on('error', (err) => {
        expect(err).to.be.an.instanceof(Error);
        expect(err.message).to.match(/^Converting circular structure to JSON/);

        done();
      })
      .on('end', () => {
        done(new Error('end should not be called'));
      })
      .resume();
  });

  it('emits an error for circular references on a Duplex stream', (done) => {
    const addlData = {};

    addlData.circ = addlData;

    const duplexStream = getDuplexStream(data.concat([addlData]), {
      objectMode: true
    });

    duplexStream
      .pipe(stringify())
      .on('error', (err) => {
        expect(err).to.be.an.instanceof(Error);
        expect(err.message).to.match(/^Converting circular structure to JSON/);

        done();
      })
      .on('end', () => {
        done(new Error('end should not be called'));
      })
      .resume();
  });

  it('can be parsed and strinigified multiple times without fail', (done) => {
    const readableStream = getReadableStream(data, {
      objectMode: true
    });
    const finalData = [];

    readableStream
      .pipe(stringify())
      .pipe(parse())
      .pipe(stringify())
      .pipe(parse())
      .pipe(stringify())
      .pipe(parse())
      .on('data', (chunk) => {
        finalData.push(chunk);
      })
      .on('end', () => {
        expect(finalData).to.deep.equal(data);

        done();
      });
  });
});
