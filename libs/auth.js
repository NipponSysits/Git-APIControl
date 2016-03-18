var Q = require('q');
var conn = require("./db");
var db = conn.connect();

module.exports = {
	access: function(headers) {
    var def = Q.defer();
	  var auth = headers['authorization'];
	  if (auth === void 0) {
	  	def.resolve(false);
	  } else {
	    var creds = (new Buffer(auth.split(' ')[1], 'base64')).toString().split(':');
	    var sql = 'SELECT password FROM user WHERE username=:username';
	    db.query(sql, { username: creds[0] }).then(function(row){
	    	if(row.length > 0) {
	    		def.resolve(row[0].password == creds[1]);
	    	} else {
	    		def.resolve(false);
	    	}
	    }).catch(function(ex){
	    	console.log('access', ex);
	    	def.resolve(false);
	    });
	  }
    return def.promise;
	},
	username: function(headers) {
    var def = Q.defer();
    var creds = (new Buffer(headers['authorization'].split(' ')[1], 'base64')).toString().split(':');
    creds = { username: creds[0], password: creds[1] };
		db.selectOne('user_access', { username: creds.username }).then(function(user){
			def.resolve(user);
		}).catch(function(ex){
    	console.log('username', ex);
			def.resolve({});
		});
    return def.promise;
	},
	permission: function(repo, user){
    var def = Q.defer();
    // if(RegExp(user.username+"/").exec(repo)) {
    // 	def.resolve(true);
    // } else {
			db.selectOne('url', { url: repo }).then(function(row){
				console.log(row.repository_id)
			}).catch(function(ex){
			  def.resolve(false);
			  console.log('permission', ex);
			});
    // }
    return def.promise;
	}
}