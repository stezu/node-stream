/* jshint node:true, mocha: true */

var stream = require('stream');
var _ = require('lodash');
var expect = require('chai').expect;
var forEachObj = require('../lib/forEachObj.js');

describe('[forEachObj]', function() {
    var data = ['item1', new Buffer('item2'), 'item3', 'item4'];
    var objData = [true, 'item', 5, { obj: 'mode' }, [1, 2, 3]];

    function runTest(stream, objectMode, done) {
        var idx = 0;

        function onData(chunk) {

            if (objectMode) {
                expect(chunk).to.deep.equal(objData[idx]);
            } else {
                expect(chunk).to.be.an.instanceof(Buffer);
                expect(chunk).to.deep.equal(new Buffer(data[idx]));
            }

            idx++;
        }

        function onEnd(err) {
            expect(arguments).to.have.length(0);

            if (objectMode) {
                expect(idx).to.equal(objData.length);
            } else {
                expect(idx).to.equal(data.length);
            }

            done();
        }

        forEachObj(stream, onData, onEnd);
    }

    it('iterates through a Readable stream', function(done) {
        var readableStream = new stream.Readable();

        readableStream._read = (function() {
            var d = data.slice();

            return function() {
                if (d.length > 0) {
                    this.push(d.shift());
                } else {
                    this.push(null);
                }
            };
        }());

        runTest(readableStream, false, done);
    });

    it('iterates through a Readable object stream', function(done) {
        var readableStream = new stream.Readable({
            objectMode: true
        });

        readableStream._read = (function() {
            var d = objData.slice();

            return function() {
                if (d.length > 0) {
                    this.push(d.shift());
                } else {
                    this.push(null);
                }
            };
        }());

        runTest(readableStream, true, done);
    });

    it('returns an error for a Readable stream', function(done) {
        var readableStream = new stream.Readable();

        readableStream._read = (function() {
            var d = data.slice().concat([12]);

            return function() {
                if (d.length > 0) {
                    this.push(d.shift());
                } else {
                    this.push(null);
                }
            };
        }());

        forEachObj(readableStream, _.noop, function(err) {
            expect(arguments).to.have.length(1);
            expect(err).to.be.an.instanceof(Error);
            expect(err.message).to.equal('Invalid non-string/buffer chunk');
            done();
        });
    });

    it('iterates through a Duplex stream', function(done) {
        var duplexStream = new stream.Duplex();

        duplexStream._read = (function() {
            var d = data.slice();

            return function() {
                if (d.length > 0) {
                    this.push(d.shift());
                } else {
                    this.push(null);
                }
            };
        }());

        runTest(duplexStream, false, done);
    });

    it('iterates through a Duplex object stream', function(done) {
        var duplexStream = new stream.Duplex({
            objectMode: true
        });

        duplexStream._read = (function() {
            var d = objData.slice();

            return function() {
                if (d.length > 0) {
                    this.push(d.shift());
                } else {
                    this.push(null);
                }
            };
        }());

        runTest(duplexStream, true, done);
    });

    it('returns an error for a Duplex stream', function(done) {
        var duplexStream = new stream.Duplex();

        duplexStream._read = (function() {
            var d = data.slice().concat([12]);

            return function() {
                if (d.length > 0) {
                    this.push(d.shift());
                } else {
                    this.push(null);
                }
            };
        }());

        forEachObj(duplexStream, _.noop, function(err) {
            expect(arguments).to.have.length(1);
            expect(err).to.be.an.instanceof(Error);
            expect(err.message).to.equal('Invalid non-string/buffer chunk');
            done();
        });
    });
});
