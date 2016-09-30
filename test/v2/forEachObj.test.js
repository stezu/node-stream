var expect = require('chai').expect;

var getReadableStream = require('../_utilities/getReadableStream.js');
var getDuplexStream = require('../_utilities/getDuplexStream.js');
var forEachObj = require('../../').forEach.obj;

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

  it('iterates through a Readable stream', function (done) {
    var readableStream = getReadableStream(data);

    runTest(readableStream, false, done);
  });

  it('iterates through a Readable object stream', function (done) {
    var readableStream = getReadableStream(objData, {
      objectMode: true
    });

    runTest(readableStream, true, done);
  });

  it('iterates through a Duplex stream', function (done) {
    var duplexStream = getDuplexStream(data);

    runTest(duplexStream, false, done);
  });

  it('iterates through a Duplex object stream', function (done) {
    var duplexStream = getDuplexStream(objData, {
      objectMode: true
    });

    runTest(duplexStream, true, done);
  });
});
