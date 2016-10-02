var expect = require('chai').expect;

var runBasicStreamTests = require('../../_utilities/runBasicStreamTests.js');
var waitObj = require('../../../').wait.obj;

describe('[v2-waitObj]', function () {
  var data = ['item1', new Buffer('item2'), 'item3', 'item4'];
  var expected = ['item1', 'item2', 'item3', 'item4'];
  var objData = [true, 'item', 5, { obj: 'mode' }, [1, 2, 3]];

  function runTest(stream, objectMode, done) {
    var actual = [];

    stream
      .pipe(waitObj())
      .on('data', function (chunk) {
        actual.push(chunk);
      })
      .on('error', done)
      .on('end', function () {
        expect(actual).to.have.lengthOf(1);

        if (objectMode) {
          expect(actual[0]).to.deep.equal(objData);
        } else {
          expect(actual[0]).to.deep.equal(expected.map(function (item) {
            return new Buffer(item);
          }));
        }

        done();
      });
  }

  runBasicStreamTests(data, objData, runTest);
});
