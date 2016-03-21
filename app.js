var http = require('http');
var Q = require('q');
var moment = require('moment');
var config = require("./app.config");
var repos = require('pushover')(config.path, { autoCreate: false });

var control = require("./libs/control");
var auth = require("./libs/auth");
var conn = require("./libs/db");

process.env['PATH'] = process.env['PATH'] + ';' + config.core + ';' + config.lfs

var api = http.createServer(function(req, res){

});

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
repos.on('push', function(push) {
  console.log('push ' + push.repo + '/' + push.commit + ' (' + push.branch + ')');
  push.accept(function(){ return 'callback test'; });
});

repos.on('fetch', function(fetch) {
  console.log('fetch ' + fetch.repo + '/' + fetch.commit);
  fetch.accept();
});


repos.on('tag', function(tag) {
  console.log('tag ' + tag.repo + '/' + tag.commit);
  tag.accept();
});


repos.on('info', function(info) {
  auth.username(info.headers).then(function(user){
    // console.log('info check', user.level);
    if(user.level > 0) {
      auth.permission(info.repo, user).then(function(accept){
        // console.log('accept', accept);
        if(accept) {
          console.log(user.username,'get /'+info.repo);
          info.accept();
        } else {
          info.reject();
        }
      });
    } else {
      console.log(user.username, "("+user.fullname+")",'get /'+info.repo);
      info.accept();
    }
  });
});

repos.on('head', function(head) {
  console.log('head ' + head.repo);
  head.accept();
});
repos.on('response', function(response, done) {
  console.log('response',response);
  done();
});



var db = conn.connect();
db.select('permission', {}).then(function(rows){
  var items = [];
  rows.forEach(function(row){ items.push(control.create(row.url)); });
  return Q.all(items);
}).then(function(){
  // SERVER SOURCECONTROL //
  git.listen(config.git, function() {
    console.log('SourceControl listening on port ' + config.git + ' at ' + moment().format("HH:mm:ss"));
    console.log('sample:', 'http://'+config.domain+':'+config.git+'/collection/product-test.git');
  });
}).catch(function(ex){
  db.end();
  console.log('error:', ex);
});

// SERVER APISERVER //
api.listen(config.api, function() {
    console.log('API Server is listening on port ' + config.api + ' at ' + moment().format("H:mm:ss"));
});