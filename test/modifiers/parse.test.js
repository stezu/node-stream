var expect = require('chai').expect;

var getReadableStream = require('../_utilities/getReadableStream.js');
var getDuplexStream = require('../_utilities/getDuplexStream.js');
var runBasicStreamTests = require('../_utilities/runBasicStreamTests.js');
var parse = require('../../').parse;

describe('[parse]', function () {
  var data = ['"str"', new Buffer('{"a":true}'), '{"b": "c"}'];
  var expected = ['str', { a: true }, { b: 'c' }];

  function runTest(stream, objectMode, done) {
    var actual = [];

    stream
      .pipe(parse())
      .on('data', function (chunk) {
        actual.push(chunk);
      })
      .on('error', done)
      .on('end', function () {
        expect(actual).to.deep.equal(expected);

        done();
      });
  }

  runBasicStreamTests(data, data, runTest);

  it('emits an error for invalid JSON on a Readable stream', function (done) {
    var readableStream = getReadableStream(data.concat(['{"non":"json}']));

    readableStream
      .pipe(parse())
      .on('error', function (err) {
        expect(err).to.be.an.instanceof(Error);
        expect(err.message).to.match(/^Unexpected end of(?: JSON)? input$/);

        done();
      })
      .on('end', function () {
        throw new Error('end should not be called');
      })
      .resume();
  });

  it('emits an error for invalid JSON on a Duplex stream', function (done) {
    var duplexStream = getDuplexStream(data.concat(['{"non":"json}']));

    duplexStream
      .pipe(parse())
      .on('error', function (err) {
        expect(err).to.be.an.instanceof(Error);
        expect(err.message).to.match(/^Unexpected end of(?: JSON)? input$/);

        done();
      })
      .on('end', function () {
        throw new Error('end should not be called');
      })
      .resume();
  });

  it('removes unparseable json from a Readable stream when options.error = false', function (done) {
    var readableStream = getReadableStream(data.concat(['{"non":"json}']));
    var actual = [];

    readableStream
      .pipe(parse({
        error: false
      }))
      .on('error', function () {
        throw new Error('test should not throw any errors');
      })
      .on('data', function (chunk) {
        actual.push(chunk);
      })
      .on('end', function () {
        expect(actual).to.deep.equal(data.map(JSON.parse));
        done();
      });
  });

  it('removes unparseable json from a Duplex stream when options.error = false', function (done) {
    var duplexStream = getDuplexStream(data.concat(['{"non":"json}']));
    var actual = [];

    duplexStream
      .pipe(parse({
        error: false
      }))
      .on('error', function () {
        throw new Error('test should not throw any errors');
      })
      .on('data', function (chunk) {
        actual.push(chunk);
      })
      .on('end', function () {
        expect(actual).to.deep.equal(data.map(JSON.parse));
        done();
      });
  });
});
