var http = require('http'), mongo = require('mongodb'), monk = require('monk');
var express = require('express'), app = express();

var config = require("./../app.config")[/--(\w+)/.exec(process.argv[2] || '--serv')[1]];

app.get('/', function(req, res){	
	res.end('Hello world.');
});

app.get('/api/git-backup', function(req, res){	
	res.end();
});

http.createServer(app).listen(config.port, config.ip, function() {
    console.log((new Date()) + ' Server is listening on port ' + config.port);
});

