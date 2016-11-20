var expect = require('chai').expect;

var getReadableStream = require('../_utilities/getReadableStream.js');
var runBasicStreamTests = require('../_utilities/runBasicStreamTests.js');
var pluck = require('../../').pluck;

describe('[pluck]', function () {
  var data = [{
    name: 'bill',
    age: '24'
  }, {
    name: 'pam'
  }, {
    age: 12
  }];

  function runTest(stream, objectMode, done) {
    var expected = ['24', 12];
    var actual = [];

    stream
      .pipe(pluck('age'))
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

  it('emits an error if the passed in argument is not a string or number', function (done) {
    var readableStream = getReadableStream(data, {
      objectMode: true
    });

    readableStream
      .pipe(pluck(true))
      .on('error', function (err) {
        expect(err).to.be.an.instanceof(TypeError);
        expect(err.message).to.equal('Expected `property` to be a string or a number.');

        done();
      })
      .on('end', function () {
        throw new Error('end should not be called');
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
    var expected = [['c', 'd'], { c: ['d'] }];
    var actual = [];

    readableStream
      .pipe(pluck('a.b'))
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
