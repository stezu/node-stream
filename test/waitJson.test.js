/* jshint node:true, mocha: true */

var stream = require('stream');
var expect = require('chai').expect;
var waitJson = require('../lib/waitJson.js');

describe('[waitJson]', function() {
    var data = ['[', '{"json":"test"}', new Buffer(',{"item":"json"}'), ',{"item1":"item2"}', ']'];

    function runTest(stream, done) {

        function onEnd(err, content) {
            expect(arguments).to.have.length(2);

            expect(err).to.equal(null);

            expect(content).to.be.an('array');
            expect(content).to.deep.equal(JSON.parse(Buffer.concat(data.map(function(item) {
                return new Buffer(item);
            }))));

            done();
        }

        waitJson(stream, onEnd);
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
        }());

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
        }());

        runTest(readableStream, done);
    });

    it('returns an error for a Readable stream', function(done) {
        var readableStream = new stream.Readable();

        readableStream._read = (function() {
            var d = data.slice(0, -1).concat([',{"non":"json}', ']']);

            return function() {
                if (d.length > 0) {
                    this.push(d.shift());
                } else {
                    this.push(null);
                }
            };
        }());

        waitJson(readableStream, function(err) {
            expect(arguments).to.have.length(1);
            expect(err).to.be.an.instanceof(Error);
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
        }());

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
        }());

        runTest(duplexStream, done);
    });

    it('returns an error for a Duplex stream', function(done) {
        var duplexStream = new stream.Duplex();

        duplexStream._read = (function() {
            var d = data.slice(0, -1).concat([',{"non":"json}', ']']);

            return function() {
                if (d.length > 0) {
                    this.push(d.shift());
                } else {
                    this.push(null);
                }
            };
        }());

        waitJson(duplexStream, function(err) {
            expect(arguments).to.have.length(1);
            expect(err).to.be.an.instanceof(Error);
            done();
        });
    });
});
