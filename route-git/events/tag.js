"use strict";
const auth 		= require("$custom/touno-git").auth;
const mongo 		= require("$custom/schema");
const moment    = require("moment");
const chalk   	= require('chalk');

module.exports = function(tag) {
  var repo = tag.repo.replace(/\//g, ' -> ').replace(/\.git/g, ' project.');
  var infoTime = moment().format('HH:mm:ss, dddd');
  auth.username(tag.headers).then(function(user){
  	console.log(tag.repo, tag.commit, tag.version);
	  if(typeof tag.commit != 'undefined') {
			let log = new mongo.Commit({
				commit_id: tag.commit,
				repository_id: access.repository_id,
				author: user.fullname, 
				email: user.email, 
				subject: `added tag is '${tag.version}'`, 
				comment: null, 
				logs: false,
				since: new Date(),
			});
			log.save(function (err, log) { if (err) def.reject(err);	});
			
	  	console.log(chalk.yellow(infoTime), "tags", user.fullname, "info", repo);
	  }
  	tag.accept();
  });
}