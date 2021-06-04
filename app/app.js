var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var healthRoute = require('./routes/health');
const { readSecrets } = require('./config/secrets.config');
const { v4: uuidv4 } = require('uuid');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/historical-service/health', healthRoute);

async function init() {
  await readSecrets();
  process.env['taskName'] = uuidv4();
}

init().then(() => {
  app.listen(8080, () => {
    console.log(`Historical Service Started Successfully`);
  });
})


module.exports = app;
