var expect = require('chai').expect;

var runBasicStreamTests = require('../../_utilities/runBasicStreamTests.js');
var forEachObj = require('../../../').forEach.obj;

describe('[v2-forEachObj]', function () {
  var data = ['item1', new Buffer('item2'), 'item3', 'item4'];
  var objData = [true, 'item', 5, { obj: 'mode' }, [1, 2, 3]];

  function runTest(stream, objectMode, done) {
    var idx = 0;

    function onData(chunk) {

      if (objectMode) {
        expect(chunk).to.deep.equal(objData[idx]);
      } else {
        expect(chunk).to.be.an.instanceof(Buffer);
        expect(chunk).to.deep.equal(new Buffer(data[idx]));
      }
    }

    function onEnd() {
      expect(arguments).to.have.lengthOf(0);

      if (objectMode) {
        expect(idx).to.equal(objData.length);
      } else {
        expect(idx).to.equal(data.length);
      }
    }

    stream
      .pipe(forEachObj(onData, onEnd))
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
