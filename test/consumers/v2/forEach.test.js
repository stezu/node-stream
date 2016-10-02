var expect = require('chai').expect;

var runBasicStreamTests = require('../../_utilities/runBasicStreamTests.js');
var forEach = require('../../../').forEach;

describe('[v2-forEach]', function () {
  var data = ['item1', new Buffer('item2'), 'item3', 'item4'];

  function runTest(stream, objectMode, done) {
    var idx = 0;

    function onData(chunk) {
      expect(chunk).to.be.an.instanceof(Buffer);
      expect(chunk).to.deep.equal(new Buffer(data[idx]));
    }

    function onEnd() {
      expect(arguments).to.have.lengthOf(0);
      expect(idx).to.equal(data.length);
    }

    stream
      .pipe(forEach(onData, onEnd))
      .on('data', function (chunk) {
        expect(chunk.toString()).to.equal(data[idx].toString());

        idx += 1;
      })
      .on('error', done)
      .on('end', function () {
        expect(data).to.have.lengthOf(idx);
        done();
      });
  }

  runBasicStreamTests(data, data, runTest);
});
