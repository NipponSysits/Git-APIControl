"use strict";
const auth 		  = require("$custom/touno-git").auth;
const mongo 		= require("$custom/schema");
const moment    = require("moment");
const db 				= require("$custom/mysql").connect();
const chalk   	= require('chalk');

module.exports = function(tag) {
  var repo = tag.repo.replace(/\//g, ' -> ').replace(/\.git/g, ' project.');
  var infoTime = moment().format('HH:mm:ss, dddd');
  var user = {};
  auth.username(tag.headers).then(function(us){
  	user = us;
  	console.log(chalk.yellow(infoTime), "tags", us.fullname, "info", repo);
		return db.query('SELECT repository_id FROM repositories WHERE dir_name = :name', { name: tag.repo });
	}).then(function(repo){
  	let repository_id = repo[0].repository_id;
	  if(tag.commit) {
			let log = new mongo.Commit({
				commit_id: tag.commit,
				repository_id: repository_id,
				author: user.fullname, 
				email: user.email, 
				subject: `added tag is '${tag.version}'`, 
				comment: null, 
				logs: false,
				since: new Date(),
			});
			log.save(function (err, log) { if (err) def.reject(err);	});
	  }
  	tag.accept();
  }).catch(function(ex){
    console.log(chalk.red(infoTime), chalk.red('catch--tag'), ex);
  	tag.accept();
  });
}