'use strict';

// application dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

const app = express();

// get application constants
require('dotenv').config();
const PORT = process.env.PORT || 3000;

// set test route
// app.get('/test', (request,response) => {
//   response.send('TEST success');
// })









// open port
app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
})
