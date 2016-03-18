var config = require("../app.config");
var repos = require('pushover')(config.path, { autoCreate: false });
var Q = require('q');
var conn = require("./db");
var db = conn.connect();

module.exports = {
	create: function(path){
    var def = Q.defer();
		repos.exists(path, function(exists){
			if(!exists) {
				repos.create(path, function(err){
					if(err) { def.reject(err); } else { def.resolve(false); }
				});
			} else {
    		def.resolve(true);
			}
		})
    return def.promise;
	}
}