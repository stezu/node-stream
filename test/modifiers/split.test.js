var expect = require('chai').expect;

var getReadableStream = require('../_testHelpers/getReadableStream.js');
var runBasicStreamTests = require('../_testHelpers/runBasicStreamTests.js');
var split = require('../../').split;

describe('[split]', function () {
  var data = ['it\nem1', new Buffer('item2'), 'item3\n', 'i\ntem4'];
  var expected = ['it', 'em1item2item3', 'i', 'tem4'];

  function runTest(stream, objectMode, done) {
    var actual = [];

    stream
      .pipe(split())
      .on('data', function (chunk) {
        actual.push(chunk.toString());
      })
      .on('error', done)
      .on('end', function () {
        expect(actual).to.deep.equal(expected);
        done();
      });
  }

  runBasicStreamTests(data, data, runTest);

  it('accepts a regex matcher as the first argument', function (done) {
    var testData = ['mary had ', 'a lit', 'tle lamb who', 'se fleece was white ', 'as sn', 'ow'];
    var testExpected = ['mary', 'had', 'a', 'little', 'lamb', 'whose', 'fleece', 'was', 'white', 'as', 'snow'];
    var readableStream = getReadableStream(testData);
    var actual = [];

    readableStream
      .pipe(split(/\s+/))
      .on('data', function (chunk) {
        actual.push(chunk);
      })
      .on('error', done)
      .on('end', function () {
        expect(actual).to.deep.equal(testExpected);

        done();
      });
  });

  it('accepts a mapper as the first argument', function (done) {
    var testData = ['{"json": "parser"}\n{"parsing": "', 'json"}\n{"is', '":"fun"}\n'];
    var testExpected = [{ json: 'parser' }, { parsing: 'json' }, { is: 'fun'}];
    var readableStream = getReadableStream(testData);
    var actual = [];

    readableStream
      .pipe(split(JSON.parse))
      .on('data', function (chunk) {
        actual.push(chunk);
      })
      .on('error', done)
      .on('end', function () {
        expect(actual).to.deep.equal(testExpected);

        done();
      });
  });

  it('accepts both a string matcher and a mapper as arguments', function (done) {
    var testData = ['{"json": "parser"}banana{"parsing": "', 'json"}banana{"is', '":"fun"}'];
    var testExpected = [{ json: 'parser' }, { parsing: 'json' }, { is: 'fun'}];
    var readableStream = getReadableStream(testData);
    var actual = [];

    readableStream
      .pipe(split('banana', JSON.parse))
      .on('data', function (chunk) {
        actual.push(chunk);
      })
      .on('error', done)
      .on('end', function () {
        expect(actual).to.deep.equal(testExpected);

        done();
      });
  });
});
