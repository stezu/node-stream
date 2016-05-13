/* jshint node:true, mocha: true */

var stream = require('stream');
var _ = require('lodash');
var expect = require('chai').expect;
var forEach = require('../lib/forEach.js');

describe('[forEach]', function() {
    var data = ['item1', new Buffer('item2'), 'item3', 'item4'];

    function runTest(stream, done) {
        var idx = 0;

        function onData(chunk) {

            expect(chunk).to.be.an.instanceof(Buffer);
            expect(chunk).to.deep.equal(new Buffer(data[idx]));

            idx++;
        }

        function onEnd(err) {
            expect(arguments).to.have.length(0);
            expect(idx).to.equal(data.length);

            done();
        }

        forEach(stream, onData, onEnd);
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
        })();

        runTest(readableStream, done);
    });

    it('iterates through a Readable object stream', function(done) {
        var readableStream = new stream.Readable({
            objectMode: true
        });

        readableStream._read = (function() {
            var d = data.slice();

            return function() {
                if (d.length > 0) {
                    this.push(d.shift());
                } else {
                    this.push(null);
                }
            };
        })();

        runTest(readableStream, done);
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
        })();

        forEach(readableStream, _.noop, function(err) {
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
        })();

        runTest(duplexStream, done);
    });

    it('iterates through a Duplex object stream', function(done) {
        var duplexStream = new stream.Duplex({
            objectMode: true
        });

        duplexStream._read = (function() {
            var d = data.slice();

            return function() {
                if (d.length > 0) {
                    this.push(d.shift());
                } else {
                    this.push(null);
                }
            };
        })();

        runTest(duplexStream, done);
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
        })();

        forEach(duplexStream, _.noop, function(err) {
            expect(arguments).to.have.length(1);
            expect(err).to.be.an.instanceof(Error);
            expect(err.message).to.equal('Invalid non-string/buffer chunk');
            done();
        });
    });
});
