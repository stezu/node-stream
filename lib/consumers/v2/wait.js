var through = require('through2');
var pipeline = require('stream-combiner2');

function waitObj() {
  var data = [];

  return through.obj(
    function transform(chunk, enc, next) {
      data.push(chunk);
      next();
    },
    function Flush(next) {
      this.push(data);

      next();
    }
  );
}

function wait() {

  return pipeline.obj(
    waitObj(),
    through.obj(function (chunk, enc, next) {
      next(null, Buffer.concat(chunk.map(function (item) {
        return new Buffer(item);
      })));
    })
  );
}

function waitJson() {

  return pipeline.obj(
    wait(),
    through.obj(function (chunk, enc, next) {

      try {
        next(null, JSON.parse(chunk));
      } catch(e) {
        next(e);
      }
    })
  );
}

wait.obj = waitObj;
wait.json = waitJson;

module.exports = wait;
