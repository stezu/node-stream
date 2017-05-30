var expect = require('chai').expect;
var _ = require('lodash');

var getReadableStream = require('../../_testHelpers/getReadableStream.js');
var getDuplexStream = require('../../_testHelpers/getDuplexStream.js');
var runBasicStreamTests = require('../../_testHelpers/runBasicStreamTests.js');
var waitJson = require('../../../').wait.json;

describe('[v2-waitJson]', function () {
  var data = [
    '[',
    '{"json":"test"}',
    new Buffer(',{"item":"json"}'),
    ',{"item1":"item2"}',
    ']'
  ];

  function getRandomObject() {
    var obj = {};
    var i = 0;

    for (i = 0; i < _.random(1, 3); i++) {
      obj['item_' + i] = _.uniqueId();
    }

    return obj;
  }

  function getTestData(numberOfItems) {
    var items = _.times(numberOfItems, getRandomObject).map(JSON.stringify);

    return ['[', items.shift()]
      .concat(items.map(function (str) {
        return ',' + str;
      }))
      .concat([']']);
  }

  function expectJSON(arr) {
    return JSON.parse(Buffer.concat(arr.map(Buffer)));
  }

  function runTest(stream, objectMode, done) {
    var actual = [];

    stream
      .pipe(waitJson())
      .on('data', function (chunk) {
        actual.push(chunk);
      })
      .on('error', done)
      .on('end', function () {
        expect(actual).to.have.lengthOf(1);

        expect(actual[0]).to.deep.equal(expectJSON(data));

        done();
      });
  }

  runBasicStreamTests(data, data, runTest);

  it('returns an error for invalid JSON on a Readable stream', function (done) {
    var readableStream = getReadableStream(data.slice(0, -1).concat([',{"non":"json}', ']']));

    readableStream
      .pipe(waitJson())
      .on('error', function (err) {
        expect(err).to.be.an.instanceof(Error);
        expect(err.message).to.match(/^Unexpected end of(?: JSON)? input$/);

        done();
      })
      .on('end', function () {
        done(new Error('end should not be called'));
      })
      .resume();
  });

  it('returns an error for invalid JSON on a Duplex stream', function (done) {
    var duplexStream = getDuplexStream(data.slice(0, -1).concat([',{"non":"json}', ']']));

    duplexStream
      .pipe(waitJson())
      .on('error', function (err) {
        expect(err).to.be.an.instanceof(Error);
        expect(err.message).to.match(/^Unexpected end of(?: JSON)? input$/);

        done();
      })
      .on('end', function () {
        done(new Error('end should not be called'));
      })
      .resume();
  });

  it('optionally provides data to a callback', function (done) {
    var testData = getTestData(15);
    var stream = getReadableStream(testData);
    var actual = {
      callback: [],
      event: []
    };
    var doneCount = 0;

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
      .pipe(waitJson(function (err, chunk) {
        expect(err).to.equal(null);
        actual.callback.push(chunk);

        onDone();
      }))
      .on('data', function (chunk) {
        actual.event.push(chunk);
      })
      .on('error', done)
      .on('end', onDone);
  });

  it('reads the entire stream when given a callback', function (done) {
    var testData = getTestData(100);
    var stream = getReadableStream(testData, {
      objectMode: true
    });

    stream
      .pipe(waitJson(function (err, chunk) {
        expect(err).to.equal(null);
        expect(chunk).to.deep.equal(JSON.parse(testData.join('')));

        done();
      }));
  });
});
