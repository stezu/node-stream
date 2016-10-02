var expect = require('chai').expect;

var runBasicStreamTests = require('../../_utilities/runBasicStreamTests.js');
var waitObj = require('../../../').wait.obj;

describe('[v2-waitObj]', function () {
  var data = ['item1', new Buffer('item2'), 'item3', 'item4'];
  var objData = [true, 'item', 5, { obj: 'mode' }, [1, 2, 3]];

  function runTest(stream, objectMode, done) {
    var idx = 0;

    function onEnd(err, content) {
      expect(arguments).to.have.lengthOf(2);

      expect(err).to.equal(null);

      if (objectMode) {
        expect(content).to.deep.equal(objData);
      } else {
        expect(content).to.deep.equal(data.map(function (item) {
          return new Buffer(item);
        }));
      }
    }

    stream
      .pipe(waitObj(onEnd))
      .on('data', function (chunk) {

        if (objectMode) {
          expect(chunk).to.deep.equal(objData[idx]);
        } else {
          expect(chunk.toString()).to.equal(data[idx].toString());
        }

        idx += 1;
      })
      .on('error', done)
      .on('end', function () {

        if (objectMode) {
          expect(objData).to.have.lengthOf(idx);
        } else {
          expect(data).to.have.lengthOf(idx);
        }

        done();
      });
  }

  runBasicStreamTests(data, objData, runTest);
});
