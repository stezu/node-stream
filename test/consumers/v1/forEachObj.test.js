var _ = require('lodash');
var expect = require('chai').expect;

var getReadableStream = require('../../_utilities/getReadableStream.js');
var getDuplexStream = require('../../_utilities/getDuplexStream.js');
var runBasicStreamTests = require('../../_utilities/runBasicStreamTests.js');
var forEachObj = require('../../../').forEach.obj;

describe('[v1-forEachObj]', function () {
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

      idx += 1;
    }

    function onEnd() {
      expect(arguments).to.have.lengthOf(0);

      if (objectMode) {
        expect(idx).to.equal(objData.length);
      } else {
        expect(idx).to.equal(data.length);
      }

      done();
    }

    forEachObj(stream, onData, onEnd);
  }

  runBasicStreamTests(data, objData, runTest);

  it('returns an error for a Readable stream', function (done) {
    var readableStream = getReadableStream(data.concat([12]));

    forEachObj(readableStream, _.noop, function (err) {
      expect(arguments).to.have.lengthOf(1);
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.equal('Invalid non-string/buffer chunk');
      done();
    });
  });

  it('returns an error for a Duplex stream', function (done) {
    var duplexStream = getDuplexStream(data.concat([12]));

    forEachObj(duplexStream, _.noop, function (err) {
      expect(arguments).to.have.lengthOf(1);
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.equal('Invalid non-string/buffer chunk');
      done();
    });
  });
});
