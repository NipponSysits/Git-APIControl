const auth 		= require(".custom/touno-git").auth;
const chalk   = require('chalk');

module.exports = function(fetch) {
	auth.username(fetch.headers).then(function(user){
	  console.log(user.username, "("+user.fullname+")", chalk.blue('fetch /'+fetch.repo));
	  fetch.accept();
	}).catch(function(ex){
		fetch.reject();
	});
}