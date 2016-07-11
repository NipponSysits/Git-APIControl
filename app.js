"use strict";

const express = require('express')();
const http 		= require("http").createServer(express);
const moment  = require('moment');
const chalk   = require('chalk');
const config  = require('$custom/config');
const cron 		= require('cron');

// const io      = require('socket.io').listen(api);
const git     = require("./route-git/server");
const api     = require("./route-api/server");

console.log('arg', config.arg);

process.env['PATH'] = process.env['PATH'] + ';' + config.core + ';' + config.lfs
if(!/^5\./.exec(process.versions.node) && !/^6\./.exec(process.versions.node)) {
  console.log('\nNode version is not 5.x.x');
  process.exit()
}

// LISTEN GITSERVER //
git.listen();

// LISTEN APISERVER //
express.use('/api',[], api);
express.get('/', function(req, res){ res.end(); });

express.use("/", require('express').static(__dirname+'/asset'));
http.listen(config.api, function() {
    console.log('API Server is listening on port ' + config.api + ' at ' + moment().format("HH:mm:ss"));
});

// LISTEN SOCKET API //
const io = require( "socket.io" )(http);
io.on('connection', require('./route-io/server'));

// Schedule Task //
var bundleSchedule = new cron.CronJob('00 30 6,18 * * 1-5', function() {  
  var infoTime = moment().format(' HH:mm:ss');
  console.log(chalk.yellow(infoTime), 'Schedule:', new Date());
}, null, true);