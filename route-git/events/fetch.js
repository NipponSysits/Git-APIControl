"use strict";
const auth 		= require("$custom/touno-git").auth;
const moment  = require("moment");
const chalk   = require('chalk');

module.exports = function(fetch) {
  var infoTime = moment().format(' HH:mm:ss');
  var repo = fetch.repo.replace(/\//g, ' -> ').replace(/\.git/g, ' project.');
	auth.username(fetch.headers).then(function(user){
	  console.log(chalk.yellow(infoTime), "logs", user.fullname, "fetch",chalk.cyan(repo));
	  fetch.accept();
	}).catch(function(ex){
    console.log(chalk.red(infoTime), chalk.red('catch--fetch'), ex);
    fetch.reject();
	});
}