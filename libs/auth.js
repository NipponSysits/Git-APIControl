var Q = require('q');
var config = require("./app.config");
var conn = require("./db");
var db = conn.connect();

module.exports = {
	authorization: function(headers){
    var def = Q.defer(),
	  var auth = headers['authorization'];
	  if (auth === void 0) {
	    return false;
	  } else {
	    var creds = (new Buffer(auth.split(' ')[1], 'base64')).toString().split(':');
	    creds = { username: creds[0], password: creds[1] };
	    db.selectOne('user', { username: creds.username }).then(function(row){
	    	if(row) {
	    		def.revolve(row.password === creds.password);
	    	} else {
	    		def.revolve(false);
	    	}
	    }).catch(function(ex){
	    	def.reject(ex);
	    });
	  }
    return def.promise;
	},
	permission: function(){

	}
}