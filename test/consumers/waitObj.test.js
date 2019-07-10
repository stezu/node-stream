const expect = require('chai').expect;
const _ = require('lodash');

const getReadableStream = require('../_testHelpers/getReadableStream.js');
const runBasicStreamTests = require('../_testHelpers/runBasicStreamTests.js');
const waitObj = require('../../').wait.obj;

describe('[v2-waitObj]', () => {
  const data = ['item1', new Buffer('item2'), 'item3', 'item4'];
  const expected = ['item1', 'item2', 'item3', 'item4'];
  const objData = [true, 'item', 5, { obj: 'mode' }, [1, 2, 3]];

  function runTest(stream, objectMode, done) {
    const actual = [];

    stream
      .pipe(waitObj())
      .on('data', (chunk) => {
        actual.push(chunk);
      })
      .on('error', done)
      .on('end', () => {
        expect(actual).to.have.lengthOf(1);

        if (objectMode) {
          expect(actual[0]).to.deep.equal(objData);
        } else {
          expect(actual[0]).to.deep.equal(expected.map((item) => new Buffer(item)));
        }

        done();
      });
  }

  runBasicStreamTests(data, objData, runTest);

  it('optionally provides data to a callback', (done) => {
    const stream = getReadableStream(objData, {
      objectMode: true
    });
    const actual = {
      callback: [],
      event: []
    };
    let doneCount = 0;

    function onDone() {
      doneCount += 1;

      if (doneCount >= 2) {
        expect(actual.callback).to.have.lengthOf(1);
        expect(actual.event).to.have.lengthOf(1);

        // If they're both the same we have succeeded
        expect(actual.callback).to.deep.equal(actual.event);

        expect(actual.callback[0]).to.deep.equal(objData);

        done();
      }
    }

    stream
      .pipe(waitObj((err, chunk) => {
        expect(err).to.equal(null);
        actual.callback.push(chunk);

        onDone();
      }))
      .on('data', (chunk) => {
        actual.event.push(chunk);
      })
      .on('error', done)
      .on('end', onDone);
  });

  it('reads the entire stream when given a callback', (done) => {
    const testData = _.times(100);
    const stream = getReadableStream(testData, {
      objectMode: true
    });

    stream
      .pipe(waitObj((err, chunk) => {
        expect(err).to.equal(null);
        expect(chunk).to.deep.equal(testData);

        done();
      }));
  });
});
