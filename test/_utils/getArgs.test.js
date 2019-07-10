const expect = require('chai').expect;

const getArgs = require('../../lib/_utils/getArgs.js');

describe('[getArgs]', () => {

  function test() {
    return getArgs(arguments);
  }

  it('returns an empty array when called with no arguments', () => {
    expect(test()).to.deep.equal([]);
  });

  it('returns the first argument if it is a 0-length array', () => {
    const arr = [];

    expect(test(arr)).to.equal(arr);
  });

  it('returns the first argument if it is an array with items', () => {
    const arr = [1, 2, 'three'];

    expect(test(arr)).to.equal(arr);
  });

  it('returns an array of arguments if there is more than one', () => {
    const obj = {
      test: 'obj'
    };
    const result = test(1, 'two', 3, obj);

    // All arguments are converted to an array
    expect(result).to.deep.equal([1, 'two', 3, obj]);

    // The object is pased by reference
    expect(result[3]).to.equal(obj);
  });
});
