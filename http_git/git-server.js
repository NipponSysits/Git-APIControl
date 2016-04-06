
var http    = require('http');
var Q 			= require('q');
var moment 	= require('moment');
var config 	= require("../app.config");
var repos 	= require('pushover')(config.path, { autoCreate: false });

var control = require("../libs/control");
var auth 		= require("../libs/auth");
var conn 		= require("../libs/db");

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

var db = conn.connect();
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