const expect = require('chai').expect;
const _ = require('lodash');

const fromArray = require('../../').fromArray;

function stringify(val) {
  return JSON.stringify(val) || typeof val;
}

describe('[fromArray]', () => {

  function invalidSource(source, constructor, message) {
    expect(() => {
      fromArray(source);
    }).to.throw(constructor, message);
  }

  describe('throws an error when', () => {
    const nonArrays = ['string', false, true, null, 42, {}, _.noop];

    nonArrays.forEach((source) => {

      it(`source is the invalid value: ${stringify(source)}`, () => {
        invalidSource(source, TypeError, 'Expected `source` to be an array.');
      });
    });
  });

  it('creates a 5 item stream when given a 5 item array', (done) => {
    const source = [1, 2, 3, 4, 5];
    const dest = [];

    fromArray(source)
      .on('data', (chunk) => {
        dest.push(chunk);
      })
      .on('error', done)
      .on('end', () => {
        expect(dest).to.deep.equal(source);
        done();
      });
  });

  it('creates a 10000 item stream when given a 10000 item array', (done) => {
    const source = _.times(10000);
    const dest = [];

    fromArray(source)
      .on('data', (chunk) => {
        dest.push(chunk);
      })
      .on('error', done)
      .on('end', () => {
        expect(dest).to.deep.equal(source);
        done();
      });
  });

  it('creates an object stream with any given data', (done) => {
    const source = [_.noop, 2, '34', 'banana', true, false, {}];
    const dest = [];

    fromArray(source)
      .on('data', (chunk) => {
        dest.push(chunk);
      })
      .on('error', done)
      .on('end', () => {
        expect(dest).to.deep.equal(source);
        done();
      });
  });

  it('ends the stream if a null exists in the array', (done) => {
    const source = [1, 2, 3, null, 4, 5, 6];
    const dest = [];

    fromArray(source)
      .on('data', (chunk) => {
        dest.push(chunk);
      })
      .on('error', done)
      .on('end', () => {
        expect(dest).to.deep.equal([1, 2, 3]);
        done();
      });
  });
});
