var expect = require('chai').expect;
var _ = require('lodash');

var fromArray = require('../../').fromArray;

function stringify(val) {
  return JSON.stringify(val) || typeof val;
}

describe('[fromArray]', function () {

  function invalidSource(source, constructor, message) {
    expect(function () {
      fromArray(source);
    }).to.throw(constructor, message);
  }

  describe('throws an error when', function () {
    var nonArrays = ['string', false, true, null, 42, {}, _.noop];

    nonArrays.forEach(function (source) {

      it('source is the invalid value: ' + stringify(source), function () {
        invalidSource(source, TypeError, 'Expected `source` to be an array.');
      });
    });
  });

  it('creates a 5 item stream when given a 5 item array', function (done) {
    var source = [1, 2, 3, 4, 5];
    var dest = [];

    fromArray(source)
      .on('data', function (chunk) {
        dest.push(chunk);
      })
      .on('error', done)
      .on('end', function () {
        expect(dest).to.deep.equal(source);
        done();
      });
  });

  it('creates a 10000 item stream when given a 10000 item array', function (done) {
    var source = _.times(10000);
    var dest = [];

    fromArray(source)
      .on('data', function (chunk) {
        dest.push(chunk);
      })
      .on('error', done)
      .on('end', function () {
        expect(dest).to.deep.equal(source);
        done();
      });
  });

  it('creates an object stream with any given data', function (done) {
    var source = [_.noop, 2, '34', 'banana', true, false, {}];
    var dest = [];

    fromArray(source)
      .on('data', function (chunk) {
        dest.push(chunk);
      })
      .on('error', done)
      .on('end', function () {
        expect(dest).to.deep.equal(source);
        done();
      });
  });

  it('ends the stream if a null exists in the array', function (done) {
    var source = [1, 2, 3, null, 4, 5, 6];
    var dest = [];

    fromArray(source)
      .on('data', function (chunk) {
        dest.push(chunk);
      })
      .on('error', done)
      .on('end', function () {
        expect(dest).to.deep.equal([1, 2, 3]);
        done();
      });
  });
});
