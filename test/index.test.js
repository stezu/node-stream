var expect = require('chai').expect;
var _ = require('lodash');
var index = require('../lib/index.js');

describe('[index]', function () {

  it('exposes the correct public api', function () {
    expect(index).to.be.an('object')
      .and.to.have.all.keys('split', 'first', 'forEach', 'wait');

    expect(index.split).to.be.a('function')
      .and.to.have.length(3);

    expect(index.first).to.be.a('function')
      .and.to.have.length(2)
      .and.to.have.all.keys('obj', 'json');

    expect(index.first.obj).to.be.a('function')
      .and.to.have.length(2);
    expect(_.keys(index.first.obj)).to.have.length(0);

    expect(index.first.json).to.be.a('function')
      .and.to.have.length(2);
    expect(_.keys(index.first.json)).to.have.length(0);

    expect(index.forEach).to.be.a('function')
      .and.to.have.length(3)
      .and.to.have.all.keys('obj', 'json');

    expect(index.forEach.obj).to.be.a('function')
      .and.to.have.length(3);
    expect(_.keys(index.forEach.obj)).to.have.length(0);

    expect(index.forEach.json).to.be.a('function')
      .and.to.have.length(3);
    expect(_.keys(index.forEach.json)).to.have.length(0);

    expect(index.wait).to.be.a('function')
      .and.to.have.length(2)
      .and.to.have.all.keys('obj', 'json');

    expect(index.wait.obj).to.be.a('function')
      .and.to.have.length(2);
    expect(_.keys(index.wait.obj)).to.have.length(0);

    expect(index.wait.json).to.be.a('function')
      .and.to.have.length(2);
    expect(_.keys(index.wait.json)).to.have.length(0);
  });
});
