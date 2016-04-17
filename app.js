
const express = require('express')();
const http 		= require("http").createServer(express);
const morgan  = require('morgan');
const moment  = require('moment');
const config  = require('.custom/config');
const cron 		= require('cron');

// const io      = require('socket.io').listen(api);
const git     = require("./http_git/git-server");
const api     = require("./http_api/api-server");

process.env['PATH'] = process.env['PATH'] + ';' + config.core + ';' + config.lfs

// LISTEN GITSERVER //
git.listen();

// LISTEN APISERVER //
express.use(morgan('dev'));
express.use('/api',[], api);
express.get('/', function(req, res){ res.end(); });

http.listen(config.api, function() {
    console.log('API Server is listening on port ' + config.api + ' at ' + moment().format("H:mm:ss"));
});

// LISTEN SOCKET API //
const io = require( "socket.io" )(http);

io.on('connection', function(socket){
  console.log('user >> connected');

  socket.on('client checkin', function(data){
  	console.log('checkin', data);
  	// { created: Date.now(), username: 'guest-' }
  });
  socket.on('client checkout', function(data){
  	console.log('checkout', data);
  	// { created: Date.now(), username: 'guest-' }
  });
  socket.on('disconnect', function(){
    console.log('user << disconnected');
  });
});

// Schedule Task //
var bundleSchedule = new cron.CronJob('00 30 6,18 * * 1-5', function() {  

}, null, true);