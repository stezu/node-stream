var _ = require('lodash');
var through = require('through2');
var expect = require('chai').expect;

var getReadableStream = require('../_utilities/getReadableStream.js');
var pipelineObj = require('../../').pipeline.obj;

describe('[pipelineObj]', function () {

  function getTransformStreams() {
    var streams = [];

    function appendValue(val) {
      return through.obj(function (chunk, enc, next) {
        var returnedObj = _.clone(chunk);

        if (returnedObj.testVal) {
          returnedObj.testVal += val;
        } else {
          returnedObj.testVal = val;
        }

        next(null, returnedObj);
      });
    }

    streams.push(appendValue('hello'));
    streams.push(appendValue(' '));
    streams.push(appendValue('world'));
    streams.push(appendValue('!'));

    return streams;
  }

  it('merges multiple transform streams together', function (done) {
    var readableStream = getReadableStream([{ test: 1 }, { test: 2 }, { test: 3 }, { test: 4 }], {
      objectMode: true
    });
    var expected = [{
      test: 1,
      testVal: 'hello world!'
    }, {
      test: 2,
      testVal: 'hello world!'
    }, {
      test: 3,
      testVal: 'hello world!'
    }, {
      test: 4,
      testVal: 'hello world!'
    }];
    var actual = [];

    readableStream
      .pipe(pipelineObj(getTransformStreams()))
      .on('data', function (chunk) {
        actual.push(chunk);
      })
      .on('error', done)
      .on('end', function () {
        expect(actual).to.deep.equal(expected);

        done();
      });
  });

  it('handles errors emitted on the first stream', function (done) {
    var readableStream = getReadableStream([1, 2, 3, 4, 5], {
      objectMode: true
    });
    var returnedError = new Error('error handling test');
    var streams = getTransformStreams();

    streams[0] = through.obj(function (chunk, enc, next) {
      next(returnedError);
    });

    readableStream
      .pipe(pipelineObj.apply(null, streams))
      .on('error', function (err) {
        expect(err).to.equal(returnedError);

        done();
      })
      .on('end', function () {
        done(new Error('end should not have been called'));
      })
      .resume();
  });

  it('handles errors emitted on the last stream', function (done) {
    var readableStream = getReadableStream([1, 2, 3, 4, 5], {
      objectMode: true
    });
    var returnedError = new Error('error handling test');
    var streams = getTransformStreams();

    streams[streams.length - 1] = through.obj(function (chunk, enc, next) {
      next(returnedError);
    });

    readableStream
      .pipe(pipelineObj.apply(null, streams))
      .on('error', function (err) {
        expect(err).to.equal(returnedError);

        done();
      })
      .on('end', function () {
        done(new Error('end should not have been called'));
      })
      .resume();
  });

  it('handles errors emitted on the middle stream', function (done) {
    var readableStream = getReadableStream([1, 2, 3, 4, 5], {
      objectMode: true
    });
    var returnedError = new Error('error handling test');
    var streams = getTransformStreams();

    streams[1] = through.obj(function (chunk, enc, next) {
      next(returnedError);
    });

    readableStream
      .pipe(pipelineObj.apply(null, streams))
      .on('error', function (err) {
        expect(err).to.equal(returnedError);

        done();
      })
      .on('end', function () {
        done(new Error('end should not have been called'));
      })
      .resume();
  });

  it('returns a passthrough stream when given 0 input streams');

  it('returns the given stream when given 1 input stream');

  describe('when the duplex stream is destroyed', function () {

    it('child file descriptors are closed');

    it('child requests are aborted');

    it('child streams are destroyed');
  });

  describe('when a child stream is destroyed', function () {

    it('other child file descriptors are closed');

    it('other child requests are aborted');

    it('other child streams are destroyed');
  });
});
