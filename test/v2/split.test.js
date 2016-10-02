// var expect = require('chai').expect;

// var getReadableStream = require('../_utilities/getReadableStream.js');
// var getDuplexStream = require('../_utilities/getDuplexStream.js');
// var split = require('../../').split;

// describe('[split]', function () {
//   var data = ['it\nem1', new Buffer('item2'), 'item3\n', 'i\ntem4'];
//   var expected = ['it', 'em1item2item3', 'i', 'tem4'];

//   function runTest(stream, done) {
//     var idx = 0;
//     var actual = [];

//     stream
//       .pipe(split())
//       .on('data', function (chunk) {
//         actual.push(chunk.toString());
//       })
//       .on('error', done)
//       .on('end', function () {
//         expect(actual).to.deep.equal(expected);
//         done();
//       });
//   }

//   it('splits a Readable stream', function (done) {
//     var readableStream = getReadableStream(data);

//     runTest(readableStream, done);
//   });

//   it('splits a Readable object stream', function (done) {
//     var readableStream = getReadableStream(data, {
//       objectMode: true
//     });

//     runTest(readableStream, done);
//   });

//   it('splits a Duplex stream', function (done) {
//     var duplexStream = getDuplexStream(data);

//     runTest(duplexStream, done);
//   });

//   it('splits a Duplex object stream', function (done) {
//     var duplexStream = getDuplexStream(data, {
//       objectMode: true
//     });

//     runTest(duplexStream, done);
//   });
// });
