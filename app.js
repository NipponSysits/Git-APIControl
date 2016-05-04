
const express = require('express')();
const http 		= require("http").createServer(express);
const morgan  = require('morgan');
const moment  = require('moment');
const config  = require('.custom/config');
const db      = require(".custom/touno-db").mysql.connect();
const cron 		= require('cron');

// const io      = require('socket.io').listen(api);
const git     = require("./http_git/git-server");
const api     = require("./http_api/api-server");

process.env['PATH'] = process.env['PATH'] + ';' + config.core + ';' + config.lfs
if(!/^5\./.exec(process.versions.node)) {
  console.log('\nNode version is not 5.x.x');
  process.exit()
}

// LISTEN GITSERVER //
git.listen();

// LISTEN APISERVER //
express.use(morgan('dev'));
express.use('/api',[], api);
express.get('/', function(req, res){ res.end(); });

express.use("/", require('express').static(__dirname+'/asset'));
http.listen(config.api, function() {
    console.log('API Server is listening on port ' + config.api + ' at ' + moment().format("HH:mm:ss"));
});

// LISTEN SOCKET API //
const io = require( "socket.io" )(http);

var client = 0;
io.on('connection', function(socket){
  client++;
  console.log('client-update', client);

  socket.on('checkin-stats', function(session){
    var sql = 'select count(*) as access from user ' +
              'where username=:username and md5(password)=:key';
    db.query(sql, session).then(function(user){
      var checkin = parseInt(user[0].access) > 0 ? true : false;
      socket.emit('checkin-stats', checkin);
    }).catch(function(ex){
      console.log('err-checkin-stats', ex);
      socket.emit('checkin-stats', false);
    });
    
  	// { created: Date.now(), username: 'guest-' }
  });
  // socket.on('client checkout', function(session){
  // 	console.log('checkout', data);
  // 	// { created: Date.now(), username: 'guest-' }
  // });
  socket.on('disconnect', function(){
    client--;
    console.log('client-update', client);
  });
});

// Schedule Task //
var bundleSchedule = new cron.CronJob('00 30 6,18 * * 1-5', function() {  

}, null, true);