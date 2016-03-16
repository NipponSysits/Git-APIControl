var GitServer = require('git-server');
var newUser = {
    username:'demo',
    password:'demo'
}
var newRepo = {
    name:'myrepo',
    anonRead:true,
    users: [
        { user:newUser, permissions:['R','W'] }
    ],
    onSuccessful: {
        fetch: function() {
          return console.log('Successful fetch on "anon" repo');
        },
        push: function() {
          return console.log('Success push on "anon" repo');
        }
    }
}

server = new GitServer([ newRepo ], true, 'D:/tmp/repos', 7000);
server.on('commit', function(update, repo) {
    // do some logging or other stuff
    update.accept() //accept the update.
});
server.on('post-update', function(update, repo) {
    //do some deploy stuff
});