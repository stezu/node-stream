const fs = require('fs');

const mockFs = require('mock-fs');
const _ = require('lodash');
const through = require('through2');
const expect = require('chai').expect;

const getReadableStream = require('../_testHelpers/getReadableStream.js');
const getMockRequest = require('../_testHelpers/getMockRequest.js');
const endStream = require('../_testHelpers/endStream.js');
const pipeline = require('../../').pipeline;

describe('[pipeline]', () => {

  function getTransformStreams() {
    const streams = [];

    function appendValue(val) {
      return through((chunk, enc, next) => {
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

  it('merges multiple transform streams together', (done) => {
    const readableStream = getReadableStream(['1', '2', '3', '4', '5']);
    const expected = ['1 hello world!', '2 hello world!', '3 hello world!', '4 hello world!', '5 hello world!'];
    const actual = [];

    readableStream
      .pipe(pipeline(getTransformStreams()))
      .on('data', (chunk) => {
        actual.push(chunk.toString());
      })
      .on('error', done)
      .on('end', () => {
        expect(actual).to.deep.equal(expected);

        done();
      });
  });

  it('handles errors emitted on the first stream', (done) => {
    const readableStream = getReadableStream(['1', '2', '3', '4', '5']);
    const returnedError = new Error('error handling test');
    const streams = getTransformStreams();

    streams[0] = through((chunk, enc, next) => {
      next(returnedError);
    });

    readableStream
      .pipe(pipeline(...streams))
      .on('error', (err) => {
        expect(err).to.equal(returnedError);

        done();
      })
      .on('end', () => {
        done(new Error('end should not have been called'));
      })
      .resume();
  });

  it('handles errors emitted on the last stream', (done) => {
    const readableStream = getReadableStream(['1', '2', '3', '4', '5']);
    const returnedError = new Error('error handling test');
    const streams = getTransformStreams();

    streams[streams.length - 1] = through((chunk, enc, next) => {
      next(returnedError);
    });

    readableStream
      .pipe(pipeline(...streams))
      .on('error', (err) => {
        expect(err).to.equal(returnedError);

        done();
      })
      .on('end', () => {
        done(new Error('end should not have been called'));
      })
      .resume();
  });

  it.skip('handles errors emitted on the middle stream', (done) => {
    const readableStream = getReadableStream(['1', '2', '3', '4', '5']);
    const returnedError = new Error('error handling test');
    const streams = getTransformStreams();

    streams[1] = through((chunk, enc, next) => {
      next(returnedError);
    });

    readableStream
      .pipe(pipeline(...streams))
      .on('error', (err) => {
        expect(err).to.equal(returnedError);

        done();
      })
      .on('end', () => {
        done(new Error('end should not have been called'));
      })
      .resume();
  });

  it('returns a passthrough stream when given 0 input streams', (done) => {
    const readableStream = getReadableStream(['1', '2', '3', '4', '5']);
    const expected = ['1', '2', '3', '4', '5'];
    const actual = [];
    const testStream = pipeline();

    readableStream
      .pipe(testStream)
      .on('data', (chunk) => {
        actual.push(chunk.toString());
      })
      .on('error', done)
      .on('end', () => {
        expect(actual).to.deep.equal(expected);

        done();
      });
  });

  it('returns the given stream when given 1 input stream', (done) => {
    const readableStream = getReadableStream(['1', '2', '3', '4', '5']);
    const expected = ['1', '2', '3', '4', '5'];
    const actual = [];
    const outputStream = pipeline(readableStream);

    // The output stream should have the same contents
    outputStream
      .on('data', (chunk) => {
        actual.push(chunk.toString());
      })
      .on('error', done)
      .on('end', () => {
        expect(actual).to.deep.equal(expected);

        done();
      });
  });

  describe('when the duplex stream containing an fs read stream is destroyed', () => {
    let inputStreams, outputStream;

    before((done) => {
      mockFs({
        'read-file.txt': 'this is a test file. it has some content in it.'
      });

      inputStreams = {
        'fsRead': fs.createReadStream('read-file.txt'),
        'through': through()
      };
      outputStream = pipeline(_.values(inputStreams));

      setImmediate(() => {
        outputStream.destroy();
        done();
      });
    });

    after(() => {
      _.values(inputStreams).forEach(endStream);
      inputStreams = null;
      outputStream = null;
      mockFs.restore();
    });

    it('the file descriptor is closed', () => {
      expect(inputStreams.fsRead).to.have.property('closed').and.to.equal(true);
    });

    it('through streams are destroyed', () => {
      expect(inputStreams.through).to.have.property('_destroyed').and.to.equal(true);
    });

    it('the duplex stream is destroyed', () => {
      expect(outputStream).to.have.property('destroyed').and.to.equal(true);
    });
  });

  describe('when the duplex stream containing a request stream is destroyed', () => {
    let inputStreams, outputStream;

    before((done) => {
      inputStreams = {
        'request': getMockRequest(),
        'through': through()
      };
      outputStream = pipeline(_.values(inputStreams));

      setImmediate(() => {
        outputStream.destroy();
        done();
      });
    });

    after(() => {
      _.values(inputStreams).forEach(endStream);
      inputStreams = null;
      outputStream = null;
      mockFs.restore();
    });

    it('the request is aborted', () => {
      expect(inputStreams.request.abort.calledOnce).to.equal(true);
    });

    it('through streams are destroyed', () => {
      expect(inputStreams.through).to.have.property('_destroyed').and.to.equal(true);
    });

    it('the duplex stream is destroyed', () => {
      expect(outputStream).to.have.property('destroyed').and.to.equal(true);
    });
  });
});
