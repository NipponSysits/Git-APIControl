const auth 		= require(".custom/touno-git").auth;

module.exports = function(fetch) {
	// auth.username(fetch.headers).then(function(user){
	//   console.log(user.username, "("+user.fullname+")", chalk.blue('fetch /'+info.repo));
	  fetch.accept();
	// }).catch(function(){
	// 	fetch.reject();
	// });
}