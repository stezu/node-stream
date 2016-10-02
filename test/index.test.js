var expect = require('chai').expect;
var _ = require('lodash');
var index = require('../lib/index.js');

describe('[index]', function () {

  it('exposes the correct public api', function () {
    expect(index).to.be.an('object')
      .and.to.have.all.keys([
        'split',
        'pipeline',
        'through',
        'filter',
        'map',
        'reduce',
        'first',
        'forEach',
        'wait'
      ]);

    expect(index.split).to.be.a('function')
      .and.to.have.lengthOf(3);

    expect(index.through).to.be.a('function')
      .and.to.have.lengthOf(3);

    expect(index.through.obj).to.be.a('function')
      .and.to.have.lengthOf(3);

    expect(index.pipeline).to.be.a('function')
      .and.to.have.lengthOf(0);

    expect(index.pipeline.obj).to.be.a('function')
      .and.to.have.lengthOf(0);

    expect(index.filter).to.be.a('function')
      .and.to.have.lengthOf(1);

    expect(index.map).to.be.a('function')
      .and.to.have.lengthOf(1);

    expect(index.reduce).to.be.a('function')
      .and.to.have.lengthOf(2);

    expect(index.first).to.be.a('function')
      .and.to.have.all.keys('obj', 'json');

    expect(index.first.obj).to.be.a('function');
    expect(_.keys(index.first.obj)).to.have.lengthOf(0);

    expect(index.first.json).to.be.a('function');
    expect(_.keys(index.first.json)).to.have.lengthOf(0);

    expect(index.forEach).to.be.a('function')
      .and.to.have.all.keys('obj', 'json');

    expect(index.forEach.obj).to.be.a('function');
    expect(_.keys(index.forEach.obj)).to.have.lengthOf(0);

    expect(index.forEach.json).to.be.a('function');
    expect(_.keys(index.forEach.json)).to.have.lengthOf(0);

    expect(index.wait).to.be.a('function')
      .and.to.have.all.keys('obj', 'json');

    expect(index.wait.obj).to.be.a('function');
    expect(_.keys(index.wait.obj)).to.have.lengthOf(0);

    expect(index.wait.json).to.be.a('function');
    expect(_.keys(index.wait.json)).to.have.lengthOf(0);
  });
});
