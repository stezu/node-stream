/* global Promise */

var expect = require('chai').expect;
var _ = require('lodash');

var fromPromise = require('../../').fromPromise;

function stringify(val) {
  return JSON.stringify(val) || typeof val;
}

describe('[fromPromise]', function () {

  function invalidSource(source, constructor, message) {

    return function (done) {

      fromPromise(source)
        .on('data', _.noop)
        .on('error', function (err) {
          expect(err).to.be.instanceOf(constructor);
          expect(err.message).to.equal(message);

          done();
        })
        .on('end', function () {
          done(new Error('done was not supposed to be called'));
        });
    };
  }

  describe('emits an error when', function () {
    var nonPromises = ['string', false, true, null, 42, {}, _.noop, { then: 12 }];

    nonPromises.forEach(function (source) {

      it('source is the invalid value: ' + stringify(source), function (done) {
        invalidSource(source, TypeError, 'Expected `source` to be a promise.')(done);
      });
    });

    it('the promise rejects synchronously', function (done) {
      var err = new Error('this promise rejected');
      var source = new Promise(function (resolve, reject) {
        reject(err);
      });

      fromPromise(source)
        .on('data', _.noop)
        .on('error', function (emittedError) {
          expect(emittedError).to.equal(err);
          done();
        })
        .on('end', function () {
          done(new Error('done was not supposed to be called'));
        });
    });

    it('the promise rejects asynchronously', function (done) {
      var err = new Error('this promise rejected');
      var source = new Promise(function (resolve, reject) {
        setTimeout(function () {
          reject(err);
        }, 5);
      });

      fromPromise(source)
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

  it('creates a stream correctly when a promise is resolved synchronously', function (done) {
    var data = [-10, 42, false, {}, undefined, _.noop, true, 'banana']; // eslint-disable-line no-undefined
    var source = new Promise(function (resolve) {
      resolve(data);
    });
    var dest = [];

    fromPromise(source)
      .on('data', function (chunk) {
        dest.push(chunk);
      })
      .on('error', done)
      .on('end', function () {
        expect(dest).to.deep.equal([data]);
        done();
      });
  });

  it('creates a stream correctly when a promise is resolved asynchronously', function (done) {
    var data = [-10, 42, false, {}, undefined, _.noop, true, 'banana']; // eslint-disable-line no-undefined
    var source = new Promise(function (resolve) {

      setTimeout(function () {
        resolve(data);
      }, 5);
    });
    var dest = [];

    fromPromise(source)
      .on('data', function (chunk) {
        dest.push(chunk);
      })
      .on('error', done)
      .on('end', function () {
        expect(dest).to.deep.equal([data]);
        done();
      });
  });

  it('does not end the stream if a null exists in the promise arguments', function (done) {
    var data = [1, 2, 3, null, 4, 5, 6];
    var source = new Promise(function (resolve) {
      resolve(data);
    });
    var dest = [];

    fromPromise(source)
      .on('data', function (chunk) {
        dest.push(chunk);
      })
      .on('error', done)
      .on('end', function () {
        expect(dest).to.deep.equal([data]);
        done();
      });
  });
});
