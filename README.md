Express Router Wrapper
===================


Express Router Wrapper for promise or async-await based middlewares or functions.


Installation
--------

- Via Yarn
```bash
yarn add express express-router-wrapper
```

- Via NPM
```bash
npm i --save express express-router-wrapper
```

----------


Example
-------------

```javascript
const express = require('express');
const app = express();
const PromiseRouter = require('express-router-wrapper');

const router = new PromiseRouter();

router.get('/', (req, res) => {
  res.send('Actual get');
});

const asyncMiddleware = async (req, res) => {
  req.message = 'Async middleware';
};

router.get('/async', asyncMiddleware, (req, res) => {
  res.json(req.message);
});

router.get('/promise', (req, res) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('Promise function');
    }, 500);
  });
});

app
  .use('/', router.getOriginal())
  .listen(5000);
```