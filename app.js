const http    = require('http');
const express = require('express')();
const morgan  = require('morgan');
const moment  = require('moment');
const config  = require('.custom/config');

// const io      = require('socket.io').listen(api);
const git     = require("./http_git/git-server");
const api     = require("./http_api/api-server");

process.env['PATH'] = process.env['PATH'] + ';' + config.core + ';' + config.lfs

// io.sockets.on('connection', function (socket) {
//   console.log('client', socket);
// });

express.use(morgan('dev'));
express.use('/api',[], api);

// SERVER APISERVER //
express.listen(config.api, function() {
    console.log('API Server is listening on port ' + config.api + ' at ' + moment().format("H:mm:ss"));
});


