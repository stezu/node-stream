# Node-Stream

[![npm version][npm-version.svg]][npm] [![Build Status][build-status.svg]][travis] [![Test Coverage][coveralls.svg]][coveralls]

[npm-version.svg]: https://img.shields.io/npm/v/node-stream.svg
[npm]: https://www.npmjs.com/package/node-stream

[build-status.svg]: https://travis-ci.org/stezu/node-stream.svg?branch=master
[travis]: https://travis-ci.org/stezu/node-stream

[coveralls.svg]: https://coveralls.io/repos/github/stezu/node-stream/badge.svg?branch=master
[coveralls]: https://coveralls.io/github/stezu/node-stream?branch=master

A [Stream](https://nodejs.org/api/stream.html) is a core interface in Node which is generally misunderstood. Since Node doesn't provide a simple API for them, they are very often misused. This library aims to resolve those problems by exposing a collection of array-like methods for working with Node Streams.

Every function in Node-Stream returns an instance of a *Streams3* Stream which means you'll be using the latest implementation of Streams. This library works with the latest Streams as well as Node 0.12 Streams.

```js
const nodeStream = require('node-stream');

// Get the 5 most recent posts by stezu
db.createReadStream()
    .pipe(nodeStream.where({ type: 'post', author: 'stezu' }))
    .pipe(nodeStream.sort((a, b) => a.id > b.id))
    .pipe(nodeStream.take(5))
    .pipe(nodeStream.stringify())
    .pipe(nodeStream.intersperse('\n'))
    .pipe(process.stdout);
```

## Install

You can install using npm:

```bash
npm install --save node-stream
```

You can then `require()` node-stream:

```js
const nodeStream = require('node-stream');
```

## Documentation

Documentation can be found at [http://stezu.github.io/node-stream/](http://stezu.github.io/node-stream/).
