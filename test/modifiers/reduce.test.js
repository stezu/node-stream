var _ = require('lodash');
var expect = require('chai').expect;

var getReadableStream = require('../_utilities/getReadableStream.js');
var runBasicStreamTests = require('../_utilities/runBasicStreamTests.js');
var reduce = require('../../').reduce;

describe('[reduce]', function () {
  var data = ['item1', new Buffer('item2'), 'item3', 'item4'];
  var objData = [true, false, [1, 2, 3], 'string', '11', 95.23, { obj: true }, _.noop];

  function runTest(stream, objectMode, done) {
    var expected = ['4'];
    var objExpected = [8];
    var actual = [];

    stream
      .pipe(reduce(function (memo, chunk, next) {

        if (objectMode) {
          return next(null, memo + 1);
        }

        return next(null, (parseFloat(memo) + 1).toString());
      }, 0))
      .on('data', function (chunk) {
        actual.push(chunk);
      })
      .on('error', done)
      .on('end', function () {

        if (objectMode) {
          expect(actual).to.deep.equal(objExpected);
        } else {
          expect(actual).to.deep.equal(expected);
        }

        done();
      });
  }

  runBasicStreamTests(data, objData, runTest);

  it('stops streaming if an error is passed', function (done) {
    var readableStream = getReadableStream(data);
    var returnedError = new Error('error handling test');

    readableStream
      .pipe(reduce(function (memo, chunk, next) {
        next(returnedError);
      }))
      .on('error', function (err) {
        expect(err).to.equal(returnedError);
        done();
      })
      .on('end', function () {
        done(new Error('end should not be called'));
      })
      .resume();
  });

  it('works with a sync reducer', function (done) {
    var readableStream = getReadableStream(['mary', 'had', new Buffer('a'), 'little', 'lamb']);
    var expected = 'maryhadalittlelamb';
    var actual = '';

    readableStream
      .pipe(reduce(function (memo, chunk) {
        return memo + chunk;
      }, ''))
      .on('error', function () {
        done(new Error('error should not be called'));
      })
      .on('data', function (chunk) {
        expect(chunk).to.be.a('string');

        actual += chunk;
      })
      .on('end', function () {
        expect(actual).to.equal(expected);

        done();
      });
  });

  it('works with a sync reducer on an object stream', function (done) {
    var readableStream = getReadableStream([1, 5, 11, 4, 12], {
      objectMode: true
    });
    var expected = 33;
    var actual = 0;

    readableStream
      .pipe(reduce(function (memo, chunk) {
        return memo + chunk;
      }, 0))
      .on('error', function () {
        done(new Error('error should not be called'));
      })
      .on('data', function (chunk) {
        expect(chunk).to.be.a('number');

        actual += chunk;
      })
      .on('end', function () {
        expect(actual).to.equal(expected);

        done();
      });
  });

  it('works as a sync reducer when the function has 0 arguments', function (done) {
    var readableStream = getReadableStream(['mary', 'had', new Buffer('a'), 'little', 'lamb']);
    var expected = 1;
    var actual = null;

    readableStream
      .pipe(reduce(function () {
        return 1;
      }, 0))
      .on('error', function () {
        done(new Error('error should not be called'));
      })
      .on('data', function (chunk) {

        if (actual === expected) {
          done(new Error('data should only be called once'));
        }

        expect(chunk).to.be.a('number');

        actual = chunk;
      })
      .on('end', function () {
        expect(actual).to.equal(expected);

        done();
      });
  });

  it('works as an async reducer when the function has more than the expected arguments', function (done) {
    var readableStream = getReadableStream(['mary', 'had', new Buffer('a'), 'little', 'lamb']);
    var expected = 'maryhadalittlelamb';
    var actual = '';

    readableStream
      .pipe(reduce(function (memo, chunk, next, apple) {

        if (typeof apple !== 'undefined') {
          done(new Error('this test was expecting only three valid arguments'));
        }

        next(null, memo + chunk);
      }, ''))
      .on('error', function () {
        done(new Error('error should not be called'));
      })
      .on('data', function (chunk) {

        if (actual === expected) {
          done(new Error('data should only be called once'));
        }

        expect(chunk).to.be.a('string');

        actual = chunk;
      })
      .on('end', function () {
        expect(actual).to.equal(expected);

        done();
      });
  });
});
