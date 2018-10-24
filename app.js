'use strict';

let express = require('express'),
    bodyparser = require('body-parser'),
    config = require('./config'),
    http = require('http'),
    cookieParser = require('cookie-parser'),
    mg = require('mongodb').MongoClient,
    mongourl = 'mongodb://localhost:27017/mydb',
    session = require('express-session'),
    mongoStore = require('connect-mongo')(session),
    app = express(),
    path = require('path'),
    favicon = require('serve-favicon');

// app.use(favicon(path.join(__dirname, 'favicon.ico')))
app.set('port', config.get('port'));
mg.connect('mongodb://localhost:27017/mydb', function(err, db) {
    http.createServer(app).listen(config.get('port'), () => console.log('Express server listening on ' + config.get('port')));
});
let io = require('socket.io')(http);

app.use(cookieParser());
app.use(bodyparser.json()); //Парсить json
app.use(bodyparser.urlencoded({ extended: true })); //Парсить данные форм
app.use(session({
    secret: 'foo',
    store: new mongoStore({
        url: mongourl
    }),
    saveUninitialized: false, // don't create session until something stored
    resave: false,
}));

app.use(express.static(__dirname    + '/')); //


io.on('connection', function(socket){
    console.log('a user connected');
  });

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

require('./router')(app, mg);