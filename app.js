process.env['PATH'] = process.env['PATH']+';C:\\Program Files\\Git\\mingw64\\libexec\\git-core'

var http = require('http');
var repos = require('pushover')('D:/PGM-DevControl/tmp', { autoCreate: false });
var config = require("app.config")[(/--(\w+)/.exec(process.argv[2] || '--serv') || ['', 'serv'])[1]]
//

var permissableMethod = function(username, password, res) {
  var user, _ref;
  // this.log(username, 'is trying to', method, 'on repo:', repo.name, '...');
  user = getUser(username, password, repo);
  if (user === false) {
    res.statusCode = 500;
    // this.log(username, 'was rejected as this user doesnt exist, or password is wrong');
    return res.end('Wrong username or password');
  } else {
    if (_ref = this.permMap[method], user.permissions.indexOf(_ref) >= 0) {
      // this.log(username, 'Successfully did a', method, 'on', repo.name);
      repos.handle(req, res); 
    } else {
    	res.statusCode = 500;
      // this.log(username, 'was rejected, no permission to', method, 'on', repo.name);
      return res.end("You dont have these permissions");
    }
  }
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
    permissableMethod(creds[0], creds[1], res);
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


console.log("Server listen on "+config.port);
server.listen(config.port);
