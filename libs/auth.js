var Q = require('q');
var conn = require("./db");
var db = conn.connect();

module.exports = {
	authorization: function(headers) {
    var def = Q.defer();
	  var auth = headers['authorization'];
	  if (auth === void 0) {
	  	def.resolve(false);
	  } else {
	    var creds = (new Buffer(auth.split(' ')[1], 'base64')).toString().split(':');
	    creds = { username: creds[0], password: creds[1] };
	    db.selectOne('user', { username: creds.username }).then(function(row){
	    	if(row) {
	    		if(row.password !== creds.password) {
	    			def.resolve(false);
	    		} else {
	    			db.selectOne('user_access', { user_id: row.user_id }).then(function(user){
	    				def.resolve(user);
	    			}).catch(function(ex){
	    				console.log('user_access', ex);
	    				def.resolve(false);
	    			});
	    		}
	    	} else {
	    		def.resolve(false);
	    	}
	    }).catch(function(ex){
	    	console.log('user', ex);
	    	def.resolve(false);
	    });
	  }
    return def.promise;
	},
	permission: function(id){
    var def = Q.defer();

    return def.promise;
	}
}