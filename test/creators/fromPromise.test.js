const expect = require('chai').expect;
const _ = require('lodash');

const fromPromise = require('../../').fromPromise;

function stringify(val) {
  return JSON.stringify(val) || typeof val;
}

describe('[fromPromise]', () => {

  function invalidSource(source, constructor, message) {
    expect(() => {
      fromPromise(source);
    }).to.throw(constructor, message);
  }

  describe('throws an error when', () => {
    const nonPromises = ['string', false, true, null, 42, {}, _.noop, { then: 12 }, ['apple']];

    nonPromises.forEach((source) => {

      it(`source is the invalid value: ${stringify(source)}`, () => {
        invalidSource(source, TypeError, 'Expected `source` to be a promise.');
      });
    });
  });

  describe('emits an error when', () => {

    it('the promise rejects synchronously', (done) => {
      const err = new Error('this promise rejected');
      const source = new Promise(((resolve, reject) => {
        reject(err);
      }));

      fromPromise(source)
        .on('data', _.noop)
        .on('error', (emittedError) => {
          expect(emittedError).to.equal(err);
          done();
        })
        .on('end', () => {
          done(new Error('done was not supposed to be called'));
        });
    });

    it('the promise rejects asynchronously', (done) => {
      const err = new Error('this promise rejected');
      const source = new Promise(((resolve, reject) => {
        setTimeout(() => {
          reject(err);
        }, 5);
      }));

      fromPromise(source)
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

  it('creates a stream correctly when a promise is resolved synchronously', (done) => {
    const data = [-10, 42, false, {}, undefined, _.noop, true, 'banana']; // eslint-disable-line no-undefined
    const source = new Promise(((resolve) => {
      resolve(data);
    }));
    const dest = [];

    fromPromise(source)
      .on('data', (chunk) => {
        dest.push(chunk);
      })
      .on('error', done)
      .on('end', () => {
        expect(dest).to.deep.equal([data]);
        done();
      });
  });

  it('creates a stream correctly when a promise is resolved asynchronously', (done) => {
    const data = [-10, 42, false, {}, undefined, _.noop, true, 'banana']; // eslint-disable-line no-undefined
    const source = new Promise(((resolve) => {

      setTimeout(() => {
        resolve(data);
      }, 5);
    }));
    const dest = [];

    fromPromise(source)
      .on('data', (chunk) => {
        dest.push(chunk);
      })
      .on('error', done)
      .on('end', () => {
        expect(dest).to.deep.equal([data]);
        done();
      });
  });

  it('does not end the stream if a null exists in the promise arguments', (done) => {
    const data = [1, 2, 3, null, 4, 5, 6];
    const source = new Promise(((resolve) => {
      resolve(data);
    }));
    const dest = [];

    fromPromise(source)
      .on('data', (chunk) => {
        dest.push(chunk);
      })
      .on('error', done)
      .on('end', () => {
        expect(dest).to.deep.equal([data]);
        done();
      });
  });
});
