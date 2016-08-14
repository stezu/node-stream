var expect = require('chai').expect;

var getReadableStream = require('../_utilities/getReadableStream.js');
var getDuplexStream = require('../_utilities/getDuplexStream.js');
var firstObj = require('../../').first.obj;

describe('[v1-firstObj]', function() {
  var data = ['item1', new Buffer('item2'), 'item3', 'item4'];
  var objData = [true, 'item', 5, { obj: 'mode' }, [1, 2, 3]];

  function runTest(stream, objectMode, done) {

    function onEnd(err, content) {
      expect(arguments).to.have.length(2);

      expect(err).to.equal(null);

      if (objectMode) {
        expect(content).to.deep.equal(objData[0]);
      } else {
        expect(content).to.deep.equal(new Buffer(data[0]));
      }

      done();
    }

    firstObj(stream, onEnd);
  }

  it('waits for a Readable stream', function(done) {
    var readableStream = getReadableStream(data);

    runTest(readableStream, false, done);
  });

  it('waits for a Readable object stream', function(done) {
    var readableStream = getReadableStream(objData, {
      objectMode: true
    });

    runTest(readableStream, true, done);
  });

  it('returns an error for a Readable stream', function(done) {
    var readableStream = getReadableStream(data.concat([12]));

    firstObj(readableStream, function(err) {
      expect(arguments).to.have.length(1);
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.equal('Invalid non-string/buffer chunk');
      done();
    });
  });

  it('waits for a Duplex stream', function(done) {
    var duplexStream = getDuplexStream(data);

    runTest(duplexStream, false, done);
  });

  it('waits for a Duplex object stream', function(done) {
    var duplexStream = getDuplexStream(objData, {
      objectMode: true
    });

    runTest(duplexStream, true, done);
  });

  it('returns an error for a Duplex stream', function(done) {
    var duplexStream = getDuplexStream(data.concat([12]));

    firstObj(duplexStream, function(err) {
      expect(arguments).to.have.length(1);
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.equal('Invalid non-string/buffer chunk');
      done();
    });
  });
});
