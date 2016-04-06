var http    = require('http');
var express = require('express')();
var morgan  = require('morgan');
var moment  = require('moment');

var config  = require("./app.config");

var io      = require('socket.io').listen(api);
var git     = require("./http_git/git-server");
var api     = require("./http_api/api-server");

process.env['PATH'] = process.env['PATH'] + ';' + config.core + ';' + config.lfs

io.sockets.on('connection', function (socket) {
  console.log('client', socket);
});

express.use(morgan('dev'));
express.use('/control',[], api);

// SERVER APISERVER //
express.listen(config.api, function() {
    console.log('API Server is listening on port ' + config.api + ' at ' + moment().format("H:mm:ss"));
});
