/* jshint node:true, mocha: true */

var expect = require('chai').expect;
var _ = require('lodash');
var index = require('../index.js');

describe('[index]', function() {

    it('exposes the correct public api', function() {
        expect(index).to.be.an('object')
            .and.to.have.all.keys('wait', 'forEach');

        expect(index.wait).to.be.a('function')
            .and.to.have.length(2)
            .and.to.have.all.keys('obj');

        expect(index.wait.obj).to.be.a('function')
            .and.to.have.length(2);
        expect(_.keys(index.wait.obj)).to.have.length(0);

        expect(index.forEach).to.be.a('function')
            .and.to.have.length(3)
            .and.to.have.all.keys('obj');

        expect(index.forEach.obj).to.be.a('function')
            .and.to.have.length(3);
        expect(_.keys(index.forEach.obj)).to.have.length(0);
    });
});
