const express = require('express');
const app = express();
const server = require('http').createServer(app);
const expressWs = require('express-ws')(app, server);

const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const ws = require('./routes/ws');
const api = require('./routes/api');
const index = require('./routes/index');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/ws', ws);
app.use('/api', api);

app.use((err, req, res, next) => {
  if (!err.message || !err.code || err.code >= 500) {
    next(err);
  } else {
    res.status(err.code).send({ error: err.message });
  }
});

module.exports = { app, server };
