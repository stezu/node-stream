var through = require('through2');
var expect = require('chai').expect;

var getReadableStream = require('../_utilities/getReadableStream.js');
var pipeline = require('../../').pipeline;

describe('[pipeline]', function () {

  function getTransformStreams() {
    var streams = [];

    function appendValue(val) {
      return through.obj(function (chunk, enc, next) {
        next(null, chunk + val);
      });
    }

    streams.push(appendValue(' '));
    streams.push(appendValue('hello'));
    streams.push(appendValue(' '));
    streams.push(appendValue('world'));
    streams.push(appendValue('!'));

    return streams;
  }

  it('merges multiple transform streams together', function (done) {
    var readableStream = getReadableStream(['1', '2', '3', '4', '5']);
    var expected = ['1 hello world!', '2 hello world!', '3 hello world!', '4 hello world!', '5 hello world!'];
    var actual = [];

    readableStream
      .pipe(pipeline(getTransformStreams()))
      .on('data', function (chunk) {
        actual.push(chunk.toString());
      })
      .on('error', done)
      .on('end', function () {
        expect(actual).to.deep.equal(expected);

        done();
      });
  });

  it('handles errors emitted on a sub-stream', function () {
    var readableStream = getReadableStream(['1', '2', '3', '4', '5']);
    var returnedError = new Error('error handling test');
    var streams = getTransformStreams();

    streams[3] = through(function (chunk, enc, next) {
      next(returnedError);
    });

    readableStream
      .pipe(pipeline.apply(null, streams))
      .on('error', function (err) {
        expect(err).to.equal(returnedError);
      })
      .on('end', function () {
        throw new Error('end should not have been called');
      })
      .resume();
  });
});
