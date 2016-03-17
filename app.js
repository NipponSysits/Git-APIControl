process.env['PATH'] = process.env['PATH']+';C:\\Program Files\\Git\\mingw64\\libexec\\git-core'

var http = require('http');
var repos = require('pushover')(__dirname+'/tmp', { autoCreate: false });
var config = require("./app.config");
var conn = require("./libs/db");

var permissableMethod = function(username, password, req, res) {
  repos.handle(req, res); 
  // var user, _ref;
  // // this.log(username, 'is trying to', method, 'on repo:', repo.name, '...');
  // user = getUser(username, password, repo);
  // if (user === false) {
  //   res.statusCode = 500;
  //   // this.log(username, 'was rejected as this user doesnt exist, or password is wrong');
  //   return res.end('Wrong username or password');
  // } else {
  //   if (_ref = this.permMap[method], user.permissions.indexOf(_ref) >= 0) {
  //     // this.log(username, 'Successfully did a', method, 'on', repo.name);
  //     repos.handle(req, res); 
  //   } else {
  //   	res.statusCode = 500;
  //     // this.log(username, 'was rejected, no permission to', method, 'on', repo.name);
  //     return res.end("You dont have these permissions");
  //   }
  // }
};

var server = http.createServer(function (req, res) { 
  var auth, creds, plain_auth;
  auth = req.headers['authorization'];
  if (auth === void 0) {
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
    return res.end();
  } else {
    plain_auth = (new Buffer(auth.split(' ')[1], 'base64')).toString();
    creds = plain_auth.split(':');
    permissableMethod(creds[0], creds[1], req, res);
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
console.log("Git SourceControl listen on "+config.git);
server.listen(config.git);