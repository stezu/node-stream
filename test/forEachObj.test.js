/* jshint node:true, mocha: true */

var _ = require('lodash');
var expect = require('chai').expect;

var getReadableStream = require('./_utilities/getReadableStream.js');
var getDuplexStream = require('./_utilities/getDuplexStream.js');
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
        var readableStream = getReadableStream(data);

        runTest(readableStream, false, done);
    });

    it('iterates through a Readable object stream', function(done) {
        var readableStream = getReadableStream(objData, {
            objectMode: true
        });

        runTest(readableStream, true, done);
    });

    it('returns an error for a Readable stream', function(done) {
        var readableStream = getReadableStream(data.concat([12]));

        forEachObj(readableStream, _.noop, function(err) {
            expect(arguments).to.have.length(1);
            expect(err).to.be.an.instanceof(Error);
            expect(err.message).to.equal('Invalid non-string/buffer chunk');
            done();
        });
    });

    it('iterates through a Duplex stream', function(done) {
        var duplexStream = getDuplexStream(data);

        runTest(duplexStream, false, done);
    });

    it('iterates through a Duplex object stream', function(done) {
        var duplexStream = getDuplexStream(objData, {
            objectMode: true
        });

        runTest(duplexStream, true, done);
    });

    it('returns an error for a Duplex stream', function(done) {
        var duplexStream = getDuplexStream(data.concat([12]));

        forEachObj(duplexStream, _.noop, function(err) {
            expect(arguments).to.have.length(1);
            expect(err).to.be.an.instanceof(Error);
            expect(err.message).to.equal('Invalid non-string/buffer chunk');
            done();
        });
    });
});
