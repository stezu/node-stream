var expect = require('chai').expect;

var getArgs = require('../../lib/_utils/getArgs.js');

describe('[getArgs]', function () {

  function test() {
    return getArgs(arguments);
  }

  it('returns an empty array when called with no arguments', function () {
    expect(test()).to.deep.equal([]);
  });

  it('returns the first argument if it is a 0-length array', function () {
    var arr = [];

    expect(test(arr)).to.equal(arr);
  });

  it('returns the first argument if it is an array with items', function () {
    var arr = [1, 2, 'three'];

    expect(test(arr)).to.equal(arr);
  });

  it('returns an array of arguments if there is more than one', function () {
    var obj = {
      test: 'obj'
    };
    var result = test(1, 'two', 3, obj);

    // All arguments are converted to an array
    expect(result).to.deep.equal([1, 'two', 3, obj]);

    // The object is pased by reference
    expect(result[3]).to.equal(obj);
  });
});
