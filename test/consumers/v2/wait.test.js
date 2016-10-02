var expect = require('chai').expect;

var runBasicStreamTests = require('../../_utilities/runBasicStreamTests.js');
var wait = require('../../../').wait;

describe('[v2-wait]', function () {
  var data = ['item1', new Buffer('item2'), 'item3', 'item4'];
  var expected = ['item1item2item3item4'];

  function runTest(stream, objectMode, done) {
    var actual = [];

    stream
      .pipe(wait())
      .on('data', function (chunk) {
        actual.push(chunk);
      })
      .on('error', done)
      .on('end', function () {
        expect(actual).to.have.lengthOf(1);

        expect(actual).to.deep.equal(expected.map(function (item) {
          return new Buffer(item);
        }));

        done();
      });
  }

  runBasicStreamTests(data, data, runTest);
});
