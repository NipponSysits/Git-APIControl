var http = require('http');
var Q = require('q');
var moment = require('moment');
var config = require("./app.config");

var repos = require('pushover')(config.run=='dev'?__dirname+'/tmp':config.path, { autoCreate: false });

var control = require("./libs/control");
var auth = require("./libs/auth");
var conn = require("./libs/db");

process.env['PATH'] = process.env['PATH'] + ';' + config.core + ';' + config.lfs

var api = http.createServer(function(req, res){

});

var git = http.createServer(function (req, res) { 
  auth.authorization(req.headers).then(function(creds){
    if (!creds) {
      res.statusCode = 401;
      res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
      res.end();
    } else {
      repos.handle(req, res);
      // auth.permission(creds, req, res);
    }
  });
});

// EVENT
repos.on('push', function (push) {
  console.log('push ' + push.repo + '/' + push.commit + ' (' + push.branch + ')');
  push.accept();
});

repos.on('fetch', function (fetch) {
  console.log('fetch ' + fetch.repo + '/' + fetch.commit);
  fetch.accept();
});

repos.on('tag', function (tag) {
  console.log('tag ' + tag.repo + '/' + tag.commit);
  tag.accept();
});

var db = conn.connect();
db.select('url', {}).then(function(rows){
  var items = [];
  rows.forEach(function(row){ items.push(control.create(row.url)); });
  return Q.all(items);
}).then(function(){
  // SERVER SOURCECONTROL //
  git.listen(config.git, function() {
    console.log('SourceControl listening on port ' + config.git + ' at ' + moment().format("HH:mm:ss"));
  });
}).catch(function(ex){
  db.end();
  console.log('error:', ex);
});

// SERVER APISERVER //
api.listen(config.api, function() {
    console.log('API Server is listening on port ' + config.api + ' at ' + moment().format("H:mm:ss"));
});