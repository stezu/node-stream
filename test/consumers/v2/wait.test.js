var expect = require('chai').expect;

var runBasicStreamTests = require('../../_utilities/runBasicStreamTests.js');
var wait = require('../../../').wait;

describe('[v2-wait]', function () {
  var data = ['item1', new Buffer('item2'), 'item3', 'item4'];

  function runTest(stream, objectMode, done) {
    var idx = 0;

    function onEnd(err, content) {
      expect(arguments).to.have.lengthOf(2);

      expect(err).to.equal(null);

      expect(content).to.be.an.instanceof(Buffer);
      expect(content).to.deep.equal(Buffer.concat(data.map(function (item) {
        return new Buffer(item);
      })));
    }

    stream
      .pipe(wait(onEnd))
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
