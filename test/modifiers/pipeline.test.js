var fs = require('fs');

var mockFs = require('mock-fs');
var _ = require('lodash');
var through = require('through2');
var expect = require('chai').expect;

var getReadableStream = require('../_testHelpers/getReadableStream.js');
var getMockRequest = require('../_testHelpers/getMockRequest.js');
var endStream = require('../_testHelpers/endStream.js');
var pipeline = require('../../').pipeline;

describe('[pipeline]', function () {

  function getTransformStreams() {
    var streams = [];

    function appendValue(val) {
      return through(function (chunk, enc, next) {
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

  it('handles errors emitted on the first stream', function (done) {
    var readableStream = getReadableStream(['1', '2', '3', '4', '5']);
    var returnedError = new Error('error handling test');
    var streams = getTransformStreams();

    streams[0] = through(function (chunk, enc, next) {
      next(returnedError);
    });

    readableStream
      .pipe(pipeline.apply(null, streams))
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
    var readableStream = getReadableStream(['1', '2', '3', '4', '5']);
    var returnedError = new Error('error handling test');
    var streams = getTransformStreams();

    streams[streams.length - 1] = through(function (chunk, enc, next) {
      next(returnedError);
    });

    readableStream
      .pipe(pipeline.apply(null, streams))
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
    var readableStream = getReadableStream(['1', '2', '3', '4', '5']);
    var returnedError = new Error('error handling test');
    var streams = getTransformStreams();

    streams[1] = through(function (chunk, enc, next) {
      next(returnedError);
    });

    readableStream
      .pipe(pipeline.apply(null, streams))
      .on('error', function (err) {
        expect(err).to.equal(returnedError);

        done();
      })
      .on('end', function () {
        done(new Error('end should not have been called'));
      })
      .resume();
  });

  it('returns a passthrough stream when given 0 input streams', function (done) {
    var readableStream = getReadableStream(['1', '2', '3', '4', '5']);
    var expected = ['1', '2', '3', '4', '5'];
    var actual = [];
    var testStream = pipeline();

    readableStream
      .pipe(testStream)
      .on('data', function (chunk) {
        actual.push(chunk.toString());
      })
      .on('error', done)
      .on('end', function () {
        expect(actual).to.deep.equal(expected);

        done();
      });
  });

  it('returns the given stream when given 1 input stream', function (done) {
    var readableStream = getReadableStream(['1', '2', '3', '4', '5']);
    var expected = ['1', '2', '3', '4', '5'];
    var actual = [];
    var outputStream = pipeline(readableStream);

    // The output stream should have the same contents
    outputStream
      .on('data', function (chunk) {
        actual.push(chunk.toString());
      })
      .on('error', done)
      .on('end', function () {
        expect(actual).to.deep.equal(expected);

        done();
      });
  });

  describe('when the duplex stream containing an fs read stream is destroyed', function () {
    var inputStreams, outputStream;

    before(function (done) {
      mockFs({
        'read-file.txt': 'this is a test file. it has some content in it.'
      });

      inputStreams = {
        'fsRead': fs.createReadStream('read-file.txt'),
        'through': through()
      };
      outputStream = pipeline(_.values(inputStreams));

      setImmediate(function () {
        outputStream.destroy();
        done();
      });
    });

    after(function () {
      _.values(inputStreams).forEach(endStream);
      inputStreams = null;
      outputStream = null;
      mockFs.restore();
    });

    it('the file descriptor is closed', function () {
      expect(inputStreams.fsRead).to.have.property('closed').and.to.equal(true);
    });

    it('through streams are destroyed', function () {
      expect(inputStreams.through).to.have.property('_destroyed').and.to.equal(true);
    });

    it('the duplex stream is destroyed', function () {
      expect(outputStream).to.have.property('destroyed').and.to.equal(true);
    });
  });

  describe('when the duplex stream containing a request stream is destroyed', function () {
    var inputStreams, outputStream;

    before(function (done) {
      inputStreams = {
        'request': getMockRequest(),
        'through': through()
      };
      outputStream = pipeline(_.values(inputStreams));

      setImmediate(function () {
        outputStream.destroy();
        done();
      });
    });

    after(function () {
      _.values(inputStreams).forEach(endStream);
      inputStreams = null;
      outputStream = null;
      mockFs.restore();
    });

    it('the request is aborted', function () {
      expect(inputStreams.request.abort.calledOnce).to.equal(true);
    });

    it('through streams are destroyed', function () {
      expect(inputStreams.through).to.have.property('_destroyed').and.to.equal(true);
    });

    it('the duplex stream is destroyed', function () {
      expect(outputStream).to.have.property('destroyed').and.to.equal(true);
    });
  });
});
