var expect = require('chai').expect;

var runBasicStreamTests = require('../../_utilities/runBasicStreamTests.js');
var first = require('../../../').first;

describe('[v2-first]', function () {
  var data = ['item1', new Buffer('item2'), 'item3', 'item4'];

  function runTest(stream, objectMode, done) {
    var idx = 0;

    function onEnd(err, content) {
      expect(arguments).to.have.lengthOf(2);

      expect(err).to.equal(null);

      expect(content).to.be.an.instanceof(Buffer);
      expect(content).to.deep.equal(new Buffer(data[0]));
    }

    stream
      .pipe(first(onEnd))
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
