#node-stream
[![Build Status][1]][2] [![Code Climate][3]][4] [![Test Coverage][5]][6]

[1]: https://travis-ci.org/stezu/node-stream.svg?branch=master
[2]: https://travis-ci.org/stezu/node-stream

[3]: https://codeclimate.com/github/stezu/node-stream/badges/gpa.svg
[4]: https://codeclimate.com/github/stezu/node-stream

[5]: https://codeclimate.com/github/stezu/node-stream/badges/coverage.svg
[6]: https://codeclimate.com/github/stezu/node-stream/coverage

A small collection of stream consumers.

## Install

The source is available for download from [GitHub](https://github.com/stezu/node-stream). Alternatively, you can install using npm:

```bash
npm install --save node-stream
```

You can then `require()` node-stream as normal:

```js
const nodeStream = require('node-stream');
```

## Documentation

* [`forEach`](#forEach)
* [`forEach.obj`](#forEachObj)
* [`forEach.json`](#forEachJson)
* [`wait`](#wait)
* [`wait.obj`](#waitObj)
* [`wait.json`](#waitJson)

<a name="forEach"></a>
### forEach(stream, onData, onEnd)
Iterate through each data tick in a stream and call a callback with that data as a Buffer.

```js
nodeStream.forEach(
    stream,
    function(chunk) {
        // chunk is a Buffer object
    },
    function(err) {
        // err is null or an Error object
    }
);
```

<a name="forEachObj"></a>
### forEach.obj(stream, onData, onEnd)
Iterate through each data tick in a stream and call a callback with that data. Similar to `forEach`, except it does not transform the data in any way. This is best used on object streams.

```js
nodeStream.forEach.obj(
    stream,
    function(chunk) {
        // chunk can be of any type
    },
    function(err) {
        // err is null or an Error object
    }
);
```

<a name="forEachJson"></a>
### forEach.json(stream, onData, onEnd)
Iterate through each data tick in a stream and call a callback with that data. Similar to `forEach`, but returns a JSON parsed object on the data callback. The stream will error if any tick does not contain valid JSON.

```js
nodeStream.forEach.json(
    stream,
    function(chunk) {
        // chunk will be a JSON parsed object
    },
    function(err) {
        // err is null or an Error object
    }
);
```

<a name="wait"></a>
### wait(stream, onEnd)
Consume an entire stream and call a callback with a buffer of the data.

```js
nodeStream.wait(
    stream,
    function(err, data) {
        // err is null or an Error object
        // data is a Buffer object
    }
);
```

<a name="waitObj"></a>
### wait.obj(stream, onEnd)
Consume an entire stream and call a callback with an array of data. Each tick of the stream is an item in the array.

```js
nodeStream.wait.obj(
    stream,
    function(err, data) {
        // err is null or an Error object
        // data is an array
    }
);
```

<a name="waitJson"></a>
### wait.json(stream, onEnd)
Consume an entire stream and call a callback with a JSON parsed object. Stream will error if the consumed data is not parseable.

```js
nodeStream.wait.json(
    stream,
    function(err, data) {
        // err is null or an Error object
        // data is a JSON parsed object
    }
);
```
