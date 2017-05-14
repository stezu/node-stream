# Node-Stream

[![Build Status][1]][2] [![bitHound Score][3]][4] [![Test Coverage][5]][6]

[1]: https://travis-ci.org/stezu/node-stream.svg?branch=master
[2]: https://travis-ci.org/stezu/node-stream

[3]: https://www.bithound.io/github/stezu/node-stream/badges/score.svg
[4]: https://www.bithound.io/github/stezu/node-stream

[5]: https://coveralls.io/repos/github/stezu/node-stream/badge.svg?branch=master
[6]: https://coveralls.io/github/stezu/node-stream?branch=master

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
