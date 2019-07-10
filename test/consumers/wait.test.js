const expect = require('chai').expect;
const _ = require('lodash');

const getReadableStream = require('../_testHelpers/getReadableStream.js');
const runBasicStreamTests = require('../_testHelpers/runBasicStreamTests.js');
const wait = require('../../').wait;

describe('[v2-wait]', () => {
  const data = ['item1', new Buffer('item2'), 'item3', 'item4'];
  const expected = ['item1item2item3item4'];

  function runTest(stream, objectMode, done) {
    const actual = [];

    stream
      .pipe(wait())
      .on('data', (chunk) => {
        actual.push(chunk);
      })
      .on('error', done)
      .on('end', () => {
        expect(actual).to.have.lengthOf(1);

        expect(actual).to.deep.equal(expected.map((item) => new Buffer(item)));

        done();
      });
  }

  runBasicStreamTests(data, data, runTest);

  it('optionally provides data to a callback', (done) => {
    const stream = getReadableStream(data);
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

        expect(actual.callback).to.deep.equal(expected.map((item) => new Buffer(item)));

        done();
      }
    }

    stream
      .pipe(wait((err, chunk) => {
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
    const testData = _.times(100, String);
    const stream = getReadableStream(testData);

    stream
      .pipe(wait((err, chunk) => {
        expect(err).to.equal(null);
        expect(chunk.toString()).to.equal(testData.join(''));

        done();
      }));
  });
});
