const expect = require('chai').expect;
const _ = require('lodash');

const getReadableStream = require('../_testHelpers/getReadableStream.js');
const getDuplexStream = require('../_testHelpers/getDuplexStream.js');
const runBasicStreamTests = require('../_testHelpers/runBasicStreamTests.js');
const waitJson = require('../../').wait.json;

describe('[v2-waitJson]', () => {
  const data = [
    '[',
    '{"json":"test"}',
    new Buffer(',{"item":"json"}'),
    ',{"item1":"item2"}',
    ']'
  ];

  function getRandomObject() {
    const obj = {};
    let i = 0;

    for (i = 0; i < _.random(1, 3); i++) {
      obj[`item_${i}`] = _.uniqueId();
    }

    return obj;
  }

  function getTestData(numberOfItems) {
    const items = _.times(numberOfItems, getRandomObject).map(JSON.stringify);

    return ['[', items.shift()]
      .concat(items.map((str) => `,${str}`))
      .concat([']']);
  }

  function expectJSON(arr) {
    return JSON.parse(Buffer.concat(arr.map(Buffer)));
  }

  function runTest(stream, objectMode, done) {
    const actual = [];

    stream
      .pipe(waitJson())
      .on('data', (chunk) => {
        actual.push(chunk);
      })
      .on('error', done)
      .on('end', () => {
        expect(actual).to.have.lengthOf(1);

        expect(actual[0]).to.deep.equal(expectJSON(data));

        done();
      });
  }

  runBasicStreamTests(data, data, runTest);

  it('returns an error for invalid JSON on a Readable stream', (done) => {
    const readableStream = getReadableStream(data.slice(0, -1).concat([',{"non":"json}', ']']));

    readableStream
      .pipe(waitJson())
      .on('error', (err) => {
        expect(err).to.be.an.instanceof(Error);
        expect(err.message).to.match(/^Unexpected end of(?: JSON)? input$/);

        done();
      })
      .on('end', () => {
        done(new Error('end should not be called'));
      })
      .resume();
  });

  it('returns an error for invalid JSON on a Duplex stream', (done) => {
    const duplexStream = getDuplexStream(data.slice(0, -1).concat([',{"non":"json}', ']']));

    duplexStream
      .pipe(waitJson())
      .on('error', (err) => {
        expect(err).to.be.an.instanceof(Error);
        expect(err.message).to.match(/^Unexpected end of(?: JSON)? input$/);

        done();
      })
      .on('end', () => {
        done(new Error('end should not be called'));
      })
      .resume();
  });

  it('optionally provides data to a callback', (done) => {
    const testData = getTestData(15);
    const stream = getReadableStream(testData);
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

        expect(actual.callback[0]).to.deep.equal(expectJSON(testData));

        done();
      }
    }

    stream
      .pipe(waitJson((err, chunk) => {
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
    const testData = getTestData(100);
    const stream = getReadableStream(testData, {
      objectMode: true
    });

    stream
      .pipe(waitJson((err, chunk) => {
        expect(err).to.equal(null);
        expect(chunk).to.deep.equal(JSON.parse(testData.join('')));

        done();
      }));
  });
});
