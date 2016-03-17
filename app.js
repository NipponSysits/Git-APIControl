process.env['PATH'] = process.env['PATH']+';C:\\Program Files\\Git\\mingw64\\libexec\\git-core'

var pushover = require('pushover');
var repos = pushover('/tmp/repos');

repos.on('push', function (push) {
    console.log('push ' + push.repo + '/' + push.commit
        + ' (' + push.branch + ')'
    );
    push.reject("ignoe");
});

repos.on('fetch', function (fetch) {
    console.log('fetch ' + fetch.repo + '/' + fetch.commit);
    fetch.reject();
});

var http = require('http');
var server = http.createServer(function (req, res) {
    repos.handle(req, res);
});
server.listen(811);
