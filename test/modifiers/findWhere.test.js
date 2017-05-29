var expect = require('chai').expect;

var getReadableStream = require('../_utilities/getReadableStream.js');
var runBasicStreamTests = require('../_utilities/runBasicStreamTests.js');
var findWhere = require('../../').findWhere;

describe('[findWhere]', function () {
  var data = ['panama', false, {
    name: 'Blake',
    age: 5
  }, {
    not: 'valid'
  }, {
    name: 'Glen',
    age: 30
  }, {
    name: 'Bob',
    age: 30
  }];

  function runTest(stream, objectMode, done) {
    var expected = [{
      name: 'Glen',
      age: 30
    }];
    var actual = [];

    stream
      .pipe(findWhere({ age: 30 }))
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

  it('emits an error if the passed in argument is not an object', function (done) {
    var readableStream = getReadableStream(data, {
      objectMode: true
    });

    readableStream
      .pipe(findWhere('age'))
      .on('error', function (err) {
        expect(err).to.be.an.instanceof(TypeError);
        expect(err.message).to.equal('Expected `query` to be an object.');

        done();
      })
      .on('end', function () {
        done(new Error('end should not be called'));
      })
      .resume();
  });
});
