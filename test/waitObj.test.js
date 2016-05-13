/* jshint node:true, mocha: true */

var stream = require('stream');
var expect = require('chai').expect;
var waitObj = require('../lib/waitObj.js');

describe('[waitObj]', function() {
    var data = ['item1', new Buffer('item2'), 'item3', 'item4'];
    var objData = [true, 'item', 5, { obj: 'mode' }, [1, 2, 3]];

    function runTest(stream, objectMode, done) {

        function onEnd(err, content) {
            expect(arguments).to.have.length(2);

            expect(err).to.equal(null);

            if (objectMode) {
                expect(content).to.deep.equal(objData);
            } else {
                expect(content).to.deep.equal(data.map(function(item) {
                    return new Buffer(item);
                }));
            }

            done();
        }

        waitObj(stream, onEnd);
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

        runTest(readableStream, false, done);
    });

    it('waits for a Readable object stream', function(done) {
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
        })();

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
        })();

        waitObj(readableStream, function(err) {
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

        runTest(duplexStream, false, done);
    });

    it('waits for a Duplex object stream', function(done) {
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
        })();

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
        })();

        waitObj(duplexStream, function(err) {
            expect(arguments).to.have.length(1);
            expect(err).to.be.an.instanceof(Error);
            expect(err.message).to.equal('Invalid non-string/buffer chunk');
            done();
        });
    });
});
