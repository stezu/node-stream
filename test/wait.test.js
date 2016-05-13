/* jshint node:true, mocha: true */

var stream = require('stream');
var expect = require('chai').expect;
var wait = require('../lib/wait.js');

describe('[wait]', function() {
    var data = ['item1', new Buffer('item2'), 'item3', 'item4'];

    function runTest(stream, done) {

        function onEnd(err, content) {
            expect(arguments).to.have.length(2);

            expect(err).to.equal(null);

            expect(content).to.be.an.instanceof(Buffer);
            expect(content).to.deep.equal(Buffer.concat(data.map(function(item) {
                return new Buffer(item);
            })));

            done();
        }

        wait(stream, onEnd);
    }

    it('waits for a Readable stream', function(done) {
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

    it('waits for a Readable object stream', function(done) {
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

        wait(readableStream, function(err) {
            expect(arguments).to.have.length(1);
            expect(err).to.be.an.instanceof(Error);
            expect(err.message).to.equal('Invalid non-string/buffer chunk');
            done();
        });
    });

    it('waits for a Duplex stream', function(done) {
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

    it('waits for a Duplex object stream', function(done) {
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

        wait(duplexStream, function(err) {
            expect(arguments).to.have.length(1);
            expect(err).to.be.an.instanceof(Error);
            expect(err.message).to.equal('Invalid non-string/buffer chunk');
            done();
        });
    });
});
