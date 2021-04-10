const fs = require('fs');

const mockFs = require('mock-fs');
const _ = require('lodash');
const through = require('through2');
const expect = require('chai').expect;

const getReadableStream = require('../_testHelpers/getReadableStream.js');
const getMockRequest = require('../_testHelpers/getMockRequest.js');
const endStream = require('../_testHelpers/endStream.js');
const pipelineObj = require('../../').pipeline.obj;

describe('[pipelineObj]', () => {

  function getTransformStreams() {
    const streams = [];

    function appendValue(val) {
      return through.obj((chunk, enc, next) => {
        const returnedObj = _.clone(chunk);

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

  it('merges multiple transform streams together', (done) => {
    const readableStream = getReadableStream([{ test: 1 }, { test: 2 }, { test: 3 }, { test: 4 }], {
      objectMode: true
    });
    const expected = [{
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
    const actual = [];

    readableStream
      .pipe(pipelineObj(getTransformStreams()))
      .on('data', (chunk) => {
        actual.push(chunk);
      })
      .on('error', done)
      .on('end', () => {
        expect(actual).to.deep.equal(expected);

        done();
      });
  });

  it('handles errors emitted on the first stream', (done) => {
    const readableStream = getReadableStream([1, 2, 3, 4, 5], {
      objectMode: true
    });
    const returnedError = new Error('error handling test');
    const streams = getTransformStreams();

    streams[0] = through.obj((chunk, enc, next) => {
      next(returnedError);
    });

    readableStream
      .pipe(pipelineObj(...streams))
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
    const readableStream = getReadableStream([1, 2, 3, 4, 5], {
      objectMode: true
    });
    const returnedError = new Error('error handling test');
    const streams = getTransformStreams();

    streams[streams.length - 1] = through.obj((chunk, enc, next) => {
      next(returnedError);
    });

    readableStream
      .pipe(pipelineObj(...streams))
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
    const readableStream = getReadableStream([1, 2, 3, 4, 5], {
      objectMode: true
    });
    const returnedError = new Error('error handling test');
    const streams = getTransformStreams();

    streams[1] = through.obj((chunk, enc, next) => {
      next(returnedError);
    });

    readableStream
      .pipe(pipelineObj(...streams))
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
    const readableStream = getReadableStream([1, 2, 3, 4, 5], {
      objectMode: true
    });
    const expected = [1, 2, 3, 4, 5];
    const actual = [];
    const testStream = pipelineObj();

    readableStream
      .pipe(testStream)
      .on('data', (chunk) => {
        actual.push(chunk);
      })
      .on('error', done)
      .on('end', () => {
        expect(actual).to.deep.equal(expected);

        done();
      });
  });

  it('returns the given stream when given 1 input stream', (done) => {
    const readableStream = getReadableStream([1, 2, 3, 4, 5], {
      objectMode: true
    });
    const expected = [1, 2, 3, 4, 5];
    const actual = [];
    const outputStream = pipelineObj(readableStream);

    // The output stream should have the same contents
    outputStream
      .on('data', (chunk) => {
        actual.push(chunk);
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
      outputStream = pipelineObj(_.values(inputStreams));

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
      expect(inputStreams.through).to.have.property('destroyed').and.to.equal(true);
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
      outputStream = pipelineObj(_.values(inputStreams));

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
      expect(inputStreams.through).to.have.property('destroyed').and.to.equal(true);
    });

    it('the duplex stream is destroyed', () => {
      expect(outputStream).to.have.property('destroyed').and.to.equal(true);
    });
  });
});
