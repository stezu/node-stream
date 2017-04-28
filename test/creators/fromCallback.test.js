var expect = require('chai').expect;
var _ = require('lodash');

var fromCallback = require('../../').fromCallback;

function stringify(val) {
  return JSON.stringify(val) || typeof val;
}

describe('[fromCallback]', function () {

  function invalidSource(source, constructor, message) {
    expect(function () {
      fromCallback(source);
    }).to.throw(constructor, message);
  }

  describe('throws an error when', function () {
    var nonFunctions = ['string', false, true, null, 42, {}, ['apple']];

    nonFunctions.forEach(function (source) {

      it('source is the invalid value: ' + stringify(source), function () {
        invalidSource(source, TypeError, 'Expected `source` to be a function.');
      });
    });
  });

  describe('emits an error when', function () {

    it('the callback errors synchronously', function (done) {
      var err = new Error('this method errored');

      function source(callback) {
        callback(err);
      }

      fromCallback(source)
        .on('data', _.noop)
        .on('error', function (emittedError) {
          expect(emittedError).to.equal(err);
          done();
        })
        .on('end', function () {
          done(new Error('done was not supposed to be called'));
        });
    });

    it('the callback errors asynchronously', function (done) {
      var err = new Error('this method errored');

      function source(callback) {
        setTimeout(function () {
          callback(err);
        }, 5);
      }

      fromCallback(source)
        .on('data', _.noop)
        .on('error', function (emittedError) {
          expect(emittedError).to.equal(err);
          done();
        })
        .on('end', function () {
          done(new Error('done was not supposed to be called'));
        });
    });
  });

  it('creates a stream correctly when a callback succeeds synchronously', function (done) {
    var data = [-10, 42, false, {}, undefined, _.noop, true, 'banana']; // eslint-disable-line no-undefined
    var dest = [];

    function source(callback) {
      callback.apply(null, [null].concat(data));
    }

    fromCallback(source)
      .on('data', function (chunk) {
        dest.push(chunk);
      })
      .on('error', done)
      .on('end', function () {
        expect(dest).to.deep.equal([data]);
        done();
      });
  });

  it('creates a stream correctly when a callback succeeds asynchronously', function (done) {
    var data = [-10, 42, false, {}, undefined, _.noop, true, 'banana']; // eslint-disable-line no-undefined
    var dest = [];

    function source(callback) {
      setTimeout(function () {
        callback.apply(null, [null].concat(data));
      }, 5);
    }

    fromCallback(source)
      .on('data', function (chunk) {
        dest.push(chunk);
      })
      .on('error', done)
      .on('end', function () {
        expect(dest).to.deep.equal([data]);
        done();
      });
  });

  it('does not end the stream if a null exists in the callback arguments', function (done) {
    var data = [1, 2, 3, null, 4, 5, 6];
    var dest = [];

    function source(callback) {
      callback.apply(null, [null].concat(data));
    }

    fromCallback(source)
      .on('data', function (chunk) {
        dest.push(chunk);
      })
      .on('error', done)
      .on('end', function () {
        expect(dest).to.deep.equal([data]);
        done();
      });
  });

  it('maintains the context of the source function if it is bound');
});
