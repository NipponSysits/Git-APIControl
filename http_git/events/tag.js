"use strict";
const auth 		= require("$custom/touno-git").auth;
const moment    = require("moment");
const chalk   	= require('chalk');

module.exports = function(tag) {
  var repo = tag.repo.replace(/\//g, ' -> ').replace(/\.git/g, ' project.');
  var infoTime = moment().format('HH:mm:ss, dddd');
  auth.username(tag.headers).then(function(user){
	  if(typeof tag.commit != 'undefined') {
			// let log = new mongo.History({
			// 	commit_id: push.commit,
			// 	repository_id: access.repository_id,
			// 	author: access.fullname, 
			// 	email: access.email, 
			// 	subject: `removed your branch is '${push.branch}'`, 
			// 	comment: null, 
			// 	logs: false,
			// 	since: new Date(),
			// });
			// log.save(function (err, log) { if (err) def.reject(err);	});
			
	  	console.log(chalk.yellow(infoTime), "tags", user.fullname, "info", repo);
	  }
  	tag.accept();
  });
}