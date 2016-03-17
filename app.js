process.env['PATH'] = process.env['PATH']+';C:\\Program Files\\Git\\mingw64\\libexec\\git-core'

var http = require('http');
var moment = require('moment');
var repos = require('pushover')(__dirname+'/tmp', { autoCreate: false });

var config = require("./app.config");
var api = require("./libs/api");
var auth = require("./libs/auth");
var conn = require("./libs/db");

var permissableMethod = function(creds, req, res) {
  repos.handle(req, res); 
};
var api = http.createServer(function(req, res){

});

var git = http.createServer(function (req, res) { 
  var creds = auth.authorization(req.headers);
  if (!creds) {
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
    return res.end();
  } else {
    permissableMethod(creds, req, res);
    // auth.permission(creds, req, res);
  }
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
db.select('url').then(function(rows){
  rows.forEach(function(row){
    var git = /\/(.*)\/(.*)/.exec(row.url);
    repos.exists(row.url, function(found){
      if(!found) {
        repos.create(row.url, function(err){
          console.log(err, row.url);
        })
      }

    });
    // repos.create(repoName, function(){

    // })

    // repos.mkdir(dir, function(){
      
    // })
  });

});
// repos.exists('/dvgamers', function(found){
//   console.log(found);

// });

git.listen(config.git, function() {
    console.log('SourceControl listening on port ' + config.git + ' at ' + moment().format("DD/MM/YYYY HH:mm:ss"));
});

api.listen(config.api, function() {
    console.log('API Server is listening on port ' + config.api + ' at ' + moment().format("DD/MM/YYYY HH:mm:ss"));
});