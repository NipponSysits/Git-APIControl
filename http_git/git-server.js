const config  = require(".custom/config");
const http    = require('http');
const Q 			= require('q');
const moment 	= require('moment');
const repos 	= require('pushover')(config.path, { autoCreate: false });

const control = require(".custom/touno-git").control;
const auth 		= require(".custom/touno-git").auth;
const db 		  = require(".custom/touno-db").mysql.connect();

var git = http.createServer(function (req, res) { 
  auth.access(req.headers).then(function(next){
    if(next) {
      repos.handle(req, res);
    } else {
      res.statusCode = 401;
      res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
      res.end();
    }
  });
});

// EVENT
repos.on('push', require('./events/push'));
repos.on('fetch', require('./events/fetch'));
repos.on('tag', require('./events/tag'));
repos.on('info', require('././events/info'));
repos.on('head', require('./events/head'));
repos.on('response', require('./events/response'));

db.select('permission', {}).then(function(rows){
  var items = [];
  rows.forEach(function(row){ items.push(control.create(row.url)); });
  return Q.all(items);
}).then(function(){
  // SERVER SOURCECONTROL //
  git.listen(config.git, function() {
    console.log('SourceControl listening on port ' + config.git + ' at ' + moment().format("HH:mm:ss"));
    // console.log('sample:', 'http://'+config.domain+':'+config.git+'/collection/product-test.git');
  });
}).catch(function(ex){
  db.end();
  console.log('error:', ex);
});

module.exports = {}