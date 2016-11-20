var expect = require('chai').expect;

// var getReadableStream = require('../_utilities/getReadableStream.js');
var runBasicStreamTests = require('../_utilities/runBasicStreamTests.js');
var where = require('../../').where;

describe('[where]', function () {
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
    }, {
      name: 'Bob',
      age: 30
    }];
    var actual = [];

    stream
      .pipe(where({ age: 30 }))
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
});
