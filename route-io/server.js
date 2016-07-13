const moment   = require('moment');
const chalk    = require('chalk');
const config   = require('$custom/config');
const mongo    = require("$custom/schema");
const control  = require("$custom/touno-git").control;
const db       = require("$custom/mysql").connect();

var client = -1;

module.exports = function(socket){
  client++;
  socket.on('no-client', function(){
    client--;
  });

  socket.on('web-client', function(session){
		// var conn = mongoose.createConnection(process.env.MONGO_URL);
		// conn.once('open', function() {
		// });
  });

  socket.on('checkin-stats', function(session){
    var sql = 'select count(*) as access from user where username=:username and password=:key';
    db.query(sql, session).then(function(user){
      var checkin = parseInt(user[0].access) > 0 ? true : false;
      socket.emit('checkin-stats', checkin);
    }).catch(function(ex){
      console.log('err-checkin-stats', ex);
      socket.emit('checkin-stats', false);
    });
  });

  socket.on('upload-notification', function(notification){
    var infoTime = moment().format(' HH:mm:ss');
    console.log(chalk.yellow(infoTime), "notification", notification.repo);
    socket.broadcast.emit('push-notification', notification);
  });

  socket.on('disconnect', function(){
    client--;
  });
}