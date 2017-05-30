var expect = require('chai').expect;

var getReadableStream = require('../_testHelpers/getReadableStream.js');
var getDuplexStream = require('../_testHelpers/getDuplexStream.js');
var runBasicStreamTests = require('../_testHelpers/runBasicStreamTests.js');
var pick = require('../../').pick;

describe('[pick]', function () {
  var data = [{
    name: 'bill',
    age: '24'
  }, {
    name: 'pam'
  }, {
    age: 12
  }];

  function runTest(stream, objectMode, done) {
    var expected = [{
      age: '24'
    }, {}, {
      age: 12
    }];
    var actual = [];

    stream
      .pipe(pick('age'))
      .on('data', function (chunk) {
        actual.push(chunk);
      })
      .on('error', done)
      .on('end', function () {
        expect(actual).to.deep.equal(expected);

        done();
      });
  }

  runBasicStreamTests(null, data, runTest);

  it('emits an error for a non-object on a Readable stream', function (done) {
    var readableStream = getReadableStream(data.concat(['string']), {
      objectMode: true
    });

    readableStream
      .pipe(pick('age'))
      .on('error', function (err) {
        expect(err).to.be.an.instanceof(TypeError);
        expect(err.message).to.match(/^Expected object, got string$/);

        done();
      })
      .on('end', function () {
        done(new Error('end should not be called'));
      })
      .resume();
  });

  it('emits an error for a non-object on a Duplex stream', function (done) {
    var duplexStream = getDuplexStream(data.concat([true]), {
      objectMode: true
    });

    duplexStream
      .pipe(pick('age'))
      .on('error', function (err) {
        expect(err).to.be.an.instanceof(TypeError);
        expect(err.message).to.match(/^Expected object, got boolean$/);

        done();
      })
      .on('end', function () {
        done(new Error('end should not be called'));
      })
      .resume();
  });

  it('works with dot notation', function (done) {
    var readableStream = getReadableStream([{
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
    var expected = [{ a: { b: ['c', 'd'] } }, { a: { b: { c: ['d'] } } }];
    var actual = [];

    readableStream
      .pipe(pick('a.b'))
      .on('error', done)
      .on('data', function (chunk) {
        actual.push(chunk);
      })
      .on('end', function () {
        expect(actual).to.deep.equal(expected);

        done();
      });
  });

  it('can pick multiple properties at a time', function (done) {
    var readableStream = getReadableStream([{
      name: 'Pam',
      age: 24,
      location: 'Florida'
    }, {
      name: 'Bill',
      age: 26,
      location: 'Alabama'
    }, {
      name: 'Jessica',
      age: 32,
      location: 'California'
    }], {
      objectMode: true
    });
    var expected = [{
      name: 'Pam',
      age: 24
    }, {
      name: 'Bill',
      age: 26
    }, {
      name: 'Jessica',
      age: 32
    }];
    var actual = [];

    readableStream
      .pipe(pick('name', 'age'))
      .on('error', done)
      .on('data', function (chunk) {
        actual.push(chunk);
      })
      .on('end', function () {
        expect(actual).to.deep.equal(expected);

        done();
      });
  });
});
