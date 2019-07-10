

const expect = require('chai').expect;

const getReadableStream = require('../_testHelpers/getReadableStream.js');
const getDuplexStream = require('../_testHelpers/getDuplexStream.js');
const runBasicStreamTests = require('../_testHelpers/runBasicStreamTests.js');
const parse = require('../../').parse;

describe('[parse]', () => {
  const data = ['"str"', new Buffer('{"a":true}'), '{"b": "c"}'];
  const expected = ['str', { a: true }, { b: 'c' }];

  function runTest(stream, objectMode, done) {
    const actual = [];

    stream
      .pipe(parse())
      .on('data', (chunk) => {
        actual.push(chunk);
      })
      .on('error', done)
      .on('end', () => {
        expect(actual).to.deep.equal(expected);

        done();
      });
  }

  runBasicStreamTests(data, data, runTest);

  it('emits an error for invalid JSON on a Readable stream', (done) => {
    const readableStream = getReadableStream(data.concat(['{"non":"json}']));

    readableStream
      .pipe(parse())
      .on('error', (err) => {
        expect(err).to.be.an.instanceof(Error);
        expect(err.message).to.match(/^Unexpected end of(?: JSON)? input$/);

        done();
      })
      .on('end', () => {
        done(new Error('end should not be called'));
      })
      .resume();
  });

  it('emits an error for invalid JSON on a Duplex stream', (done) => {
    const duplexStream = getDuplexStream(data.concat(['{"non":"json}']));

    duplexStream
      .pipe(parse())
      .on('error', (err) => {
        expect(err).to.be.an.instanceof(Error);
        expect(err.message).to.match(/^Unexpected end of(?: JSON)? input$/);

        done();
      })
      .on('end', () => {
        done(new Error('end should not be called'));
      })
      .resume();
  });

  it('removes unparseable json from a Readable stream when options.error = false', (done) => {
    const readableStream = getReadableStream(data.concat(['{"non":"json}']));
    const actual = [];

    readableStream
      .pipe(parse({
        error: false
      }))
      .on('error', () => {
        done(new Error('test should not throw any errors'));
      })
      .on('data', (chunk) => {
        actual.push(chunk);
      })
      .on('end', () => {
        expect(actual).to.deep.equal(data.map(JSON.parse));
        done();
      });
  });

  it('removes unparseable json from a Duplex stream when options.error = false', (done) => {
    const duplexStream = getDuplexStream(data.concat(['{"non":"json}']));
    const actual = [];

    duplexStream
      .pipe(parse({
        error: false
      }))
      .on('error', () => {
        done(new Error('test should not throw any errors'));
      })
      .on('data', (chunk) => {
        actual.push(chunk);
      })
      .on('end', () => {
        expect(actual).to.deep.equal(data.map(JSON.parse));
        done();
      });
  });
});
