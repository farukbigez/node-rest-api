const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const advertiseRoutes = require('./routes/advertising');
const reviewRoutes = require('./routes/reviews');
// const orderRoutes = require('./routes/orders')
// const userRoutes = require('./routes/user')

//const routes = require('./routes/init')

app.use(morgan('dev'));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Acces-Control-Allow-Origin', '*');
  res.header(
    'Acces-Control-Allow-Headers',
    'Orign, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.header('Acces-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json();
  }
  next();
});

// Sessions allow us to store data on visitors from request to request
// This keeps users logged in and allows us to send flash messages
app.use(
  session({
    secret: process.env.SECRET,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
    }),
  })
);

//Routes which should handle requests
app.use('/advertising', advertiseRoutes);
app.use('/reviews', reviewRoutes);
// app.use('/orders', orderRoutes)
// app.use('/user', userRoutes )

var user = require('./routes/users/init');

// |------------------------
// |---------> Router [ User ]
// |------------------------
app.use('/User', user.router);
// |------------------------
// |---------> Router [ ASSETS ]
// |------------------------
var fs = require('fs');

var mime = {
  html: 'text/html',
  txt: 'text/plain',
  css: 'text/css',
  gif: 'image/gif',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  js: 'application/javascript',
};

app.get('/assets/user/avatar/:id', function(req, res) {
  var name = req.params.id;

  var file = path.join(
    __dirname + '/assets/user/avatar/',
    name.replace(/\/$/, '/index.html')
  );
  // if (file.indexOf(dir + path.sep) !== 0) {
  //     return res.status(403).end('Forbidden');
  // }
  var type = mime[path.extname(file).slice(1)] || 'text/plain';
  var s = fs.createReadStream(file);
  s.on('open', function() {
    res.set('Content-Type', type);
    s.pipe(res);
  });
  s.on('error', function() {
    res.set('Content-Type', 'text/plain');
    res.status(404).end('Not found');
  });
});


module.exports = app;
