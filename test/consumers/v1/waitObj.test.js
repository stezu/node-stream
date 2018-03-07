var expect = require('chai').expect;

var getReadableStream = require('../../_testHelpers/getReadableStream.js');
var getDuplexStream = require('../../_testHelpers/getDuplexStream.js');
var runBasicStreamTests = require('../../_testHelpers/runBasicStreamTests.js');
var waitObj = require('../../../').wait.obj;

describe('[v1-waitObj]', function () {
  var data = ['item1', new Buffer('item2'), 'item3', 'item4'];
  var objData = [true, 'item', 5, { obj: 'mode' }, [1, 2, 3]];

  function runTest(stream, objectMode, done) {

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

      done();
    }

    waitObj(stream, onEnd);
  }

  runBasicStreamTests(data, objData, runTest);

  it('returns an error for a Readable stream', function (done) {
    var readableStream = getReadableStream(data.concat([12]));

    waitObj(readableStream, function (err) {
      expect(arguments).to.have.lengthOf(1);
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.be.oneOf([
        'Invalid non-string/buffer chunk',
        'The "chunk" argument must be one of type string, Buffer, or Uint8Array'
      ]);
      done();
    });
  });

  it('returns an error for a Duplex stream', function (done) {
    var duplexStream = getDuplexStream(data.concat([12]));

    waitObj(duplexStream, function (err) {
      expect(arguments).to.have.lengthOf(1);
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.be.oneOf([
        'Invalid non-string/buffer chunk',
        'The "chunk" argument must be one of type string, Buffer, or Uint8Array'
      ]);
      done();
    });
  });
});
