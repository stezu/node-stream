const expect = require('chai').expect;
const _ = require('lodash');

const fromCallback = require('../../').fromCallback;

function stringify(val) {
  return JSON.stringify(val) || typeof val;
}

describe('[fromCallback]', () => {

  function invalidSource(source, constructor, message) {
    expect(() => {
      fromCallback(source);
    }).to.throw(constructor, message);
  }

  describe('throws an error when', () => {
    const nonFunctions = ['string', false, true, null, 42, {}, ['apple']];

    nonFunctions.forEach((source) => {

      it(`source is the invalid value: ${stringify(source)}`, () => {
        invalidSource(source, TypeError, 'Expected `source` to be a function.');
      });
    });
  });

  describe('emits an error when', () => {

    it('the callback errors synchronously', (done) => {
      const err = new Error('this method errored');

      function source(callback) {
        callback(err);
      }

      fromCallback(source)
        .on('data', _.noop)
        .on('error', (emittedError) => {
          expect(emittedError).to.equal(err);
          done();
        })
        .on('end', () => {
          done(new Error('done was not supposed to be called'));
        });
    });

    it('the callback errors asynchronously', (done) => {
      const err = new Error('this method errored');

      function source(callback) {
        setTimeout(() => {
          callback(err);
        }, 5);
      }

      fromCallback(source)
        .on('data', _.noop)
        .on('error', (emittedError) => {
          expect(emittedError).to.equal(err);
          done();
        })
        .on('end', () => {
          done(new Error('done was not supposed to be called'));
        });
    });
  });

  it('creates a stream correctly when a callback succeeds synchronously', (done) => {
    const data = [-10, 42, false, {}, undefined, _.noop, true, 'banana']; // eslint-disable-line no-undefined
    const dest = [];

    function source(callback) {
      callback(...[null].concat(data));
    }

    fromCallback(source)
      .on('data', (chunk) => {
        dest.push(chunk);
      })
      .on('error', done)
      .on('end', () => {
        expect(dest).to.deep.equal([data]);
        done();
      });
  });

  it('creates a stream correctly when a callback succeeds asynchronously', (done) => {
    const data = [-10, 42, false, {}, undefined, _.noop, true, 'banana']; // eslint-disable-line no-undefined
    const dest = [];

    function source(callback) {
      setTimeout(() => {
        callback(...[null].concat(data));
      }, 5);
    }

    fromCallback(source)
      .on('data', (chunk) => {
        dest.push(chunk);
      })
      .on('error', done)
      .on('end', () => {
        expect(dest).to.deep.equal([data]);
        done();
      });
  });

  it('does not end the stream if a null exists in the callback arguments', (done) => {
    const data = [1, 2, 3, null, 4, 5, 6];
    const dest = [];

    function source(callback) {
      callback(...[null].concat(data));
    }

    fromCallback(source)
      .on('data', (chunk) => {
        dest.push(chunk);
      })
      .on('error', done)
      .on('end', () => {
        expect(dest).to.deep.equal([data]);
        done();
      });
  });

  it('maintains the context of the source function if it is bound');
});
