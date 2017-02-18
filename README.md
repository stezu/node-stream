# Node-Stream

[![Build Status][1]][2] [![bitHound Score][3]][4] [![Test Coverage][5]][6]

[1]: https://travis-ci.org/stezu/node-stream.svg?branch=master
[2]: https://travis-ci.org/stezu/node-stream

[3]: https://www.bithound.io/github/stezu/node-stream/badges/score.svg
[4]: https://www.bithound.io/github/stezu/node-stream

[5]: https://coveralls.io/repos/github/stezu/node-stream/badge.svg?branch=master
[6]: https://coveralls.io/github/stezu/node-stream?branch=master

A collection of array-like methods for working with streams.

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
