"use strict";
const auth 		= require("$custom/touno-git").auth;
const moment    = require("moment");
const chalk   	= require('chalk');

module.exports = function(tag) {
  var repo = tag.repo.replace(/\//g, ' -> ').replace(/\.git/g, ' project.');
  var infoTime = moment().format('HH:mm:ss, dddd');
  auth.username(tag.headers).then(function(user){
	  if(typeof tag.commit != 'undefined') {
	  	console.log(chalk.yellow(infoTime), "tags", user.fullname, "info", repo);
	  }
  	tag.accept();
  });
}