module.exports = {
	authorization: function(headers){
	  var auth = req.headers['authorization'];
	  if (auth === void 0) {
	    return false;
	  } else {
	    var creds = (new Buffer(auth.split(' ')[1], 'base64')).toString().split(':');
	    return { username: creds[0], password: creds[1] };
	  }
	},
	permission: function(creds, req, res){

	}
}