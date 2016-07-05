"use strict";
const config  = require("$custom/config");
const control = require("$custom/touno-git").control;
const auth 		= require("$custom/touno-git").auth;
const Q 				= require('q');
const mongo 		= require("$custom/schema");
const db 				= require("$custom/mysql").connect();
const moment		= require("moment");
const chalk 		= require('chalk');
const path 			= require('path');

module.exports = function(push) {
  push.accept(function(){
  	var infoTime = moment().format(' HH:mm:ss');
    var dirRepository = config.source+'/'+push.repo;
    var sinceFormat = 'ddd, D MMM YYYY HH:mm:ss ZZ';
    var $access = {};
		var $scopt = {
			master: 'master',
			readme: undefined,
			branch: [],
			files: []
		};
    
    var RegexCommit = 0;

    var event = {
    	getTree: false,
    	logBranchRemoved: function(){
				let def = Q.defer();

				let commited = new mongo.Commit({
					commit_id: push.commit,
    			repository_id: $access.repository_id,
    			author: $access.fullname, 
    			email: $access.email, 
    			subject: `removed your branch is '${push.branch}'`, 
    			comment: null, 
    			logs: false,
    			since: new Date(),
    		});
				commited.save(function (err, result) { if (err) def.reject(err); else def.resolve();	}); 
  			return def.promise;
  		},
    	logPushed: function(item){
  			let def = Q.defer();
    		let commit_log = /\[\](.+?)\n\[\]([a-f0-9]{40})\n\[\]([a-f0-9 ]{81}|[a-f0-9]{40}|)\n\[\](.+)\n'([\W\w]+?)'/g.exec(item);
				let author = commit_log[4].trim().split(/#/), comment = commit_log[5].trim().split(/\n\n/);
				let pushed = {
    			commit_id: commit_log[2],
    			repository_id: $access.repository_id,
    			author: author[0],
    			email: author[1], 
    			since: new Date(commit_log[1]),
    			parent_id: commit_log[3], 
    			subject: comment[0], 
    			logs: true,
    			comment: comment[1] || null, 
    		}
				let commited = new mongo.Commit(pushed);
				commited.save(function (err, result) { if (err) def.reject(err); else def.resolve(pushed);	}); 
    		return def.promise;
  		},
    	folderPrepare: function(pushed){
				let diffTree = ['diff-tree', '--no-commit-id', '--name-status', '-r', pushed.commit_id];
				let listBranch = [ 'show-branch','--list' ];


				return control.cmd('git', diffTree, dirRepository).then(function(files){
					let foundNewFile = false;
					(files.match(/.*\n/ig) || []).forEach(function(item){
						let filename = /([AMD])(.*)/g.exec(item);
						if(filename[1] === 'A' && !event.getTree) {
							foundNewFile = true;
							event.getTree = true;
							return false;
						}
					});
					if(foundNewFile) {
						console.log(' filename new -- update caches in mongodb');
						return control.cmd('git', listBranch, dirRepository).then(function(branchs){
							(branchs.match(/.*\n/ig) || []).forEach(function(item){
								let branch = /(\W).\[(.*)\]/g.exec(item);
								$scopt.branch.push(branch[2]);
								if(branch[1] === '*') $scopt.master = branch[2];
							});

							return control.cmd('git', diffTree, dirRepository);
						}).then(function(files){
							let lsTree = [ '--no-pager','ls-tree','-l', $scopt.master ];
				      return control.cmd('git', lsTree, dirRepository).then(event.filePrepare).then(event.repoCheck).then(event.repoPrepare);
						});
					}
				});
  		},
    	filePrepare: function(git){
    		let items = []
    		let CommitFile = git.match(/.*\n/ig) || [];
    		
		    CommitFile.forEach(function(logs){
		    	let filename = /\d{6}(.+)[a-f0-9]{40}([\s\d\-]+)(.*)/g.exec(logs);
		    	let type = filename[1].trim();
		    	let size = filename[2].trim();
		    	let name = filename[3].replace(/\n/g, '').trim();


	    		$scopt.readme = new Buffer("");

		    	if(name.toLowerCase() === 'readme.md') {
		    		items.push(control.cmd('git', [ '--no-pager','show',$scopt.master+':'+name ], dirRepository).then(function(text){
		    			$scopt.readme = text;
		    		}));
		    	}
		    	
		      items.push(control.cmd('git', [ 'log','-1','--format="'+type+'|'+size+'|'+name+'|%ci|%s"','--',name ], dirRepository).then(event.fileLogs))
		    });
		    return Q.all(items);
  		},
    	fileLogs: function(git){
	      let logs = /"(.*)\|(.*)\|(.*)\|(.*)\|(.*)"/ig.exec(git);
	      $scopt.files.push({
	        ext: logs[2].trim() === '-' ? null : (/\.[\w\d]+$/gm.exec(logs[3]) || [])[0] || null,
	        size: logs[2].trim() === '-' ? 0 : parseInt(logs[2].trim()),
	        filename: logs[3],
	        since: logs[4],
	        comment: logs[5].replace(/\n/g, '')
		    });
  		},
  		repoCheck: function(){
				let def = Q.defer();
				mongo.Repository.findOne({ 'repository_id': $scopt.repository_id }).exec(function(err, result){
  				console.log(chalk.green(infoTime), `${result?`updated`:`added`} filenames.`, $access.fullname, "prepare repository.");
			    if (err) { def.reject(); } else { def.resolve(result ? false : true); }
				});
    		return def.promise;
  		},
    	repoPrepare: function(InsertEvent){
				let def = Q.defer();
    		let callback = function (err, result) { 
    			if (err) def.reject(err); else def.resolve();	
    		}
    		if(InsertEvent) {
					let commited = new mongo.Repository($scopt);
					commited.save(callback); 
					console.log('mongo.Repository.save -- ', { repository_id: $scopt.repository_id });
    		} else {
    			let updated = {
						master: $scopt.master,
						readme: $scopt.readme,
						branch: $scopt.branch,
						files: $scopt.files
    			}
    			mongo.Repository.update({ repository_id: $scopt.repository_id }, { $set: updated }, callback);
					console.log('mongo.Repository.update -- ', { repository_id: $scopt.repository_id });
    		}
    		return def.promise;
  		},

    }

		auth.username(push.headers).then(function(user){
			$access = user;
  		console.log(chalk.green(infoTime), "logs", $access.fullname, "push",chalk.green(push.repo, ':', push.branch));
			return db.query('SELECT repository_id, title, description FROM repositories WHERE dir_name = :name', { name: push.repo })
		}).then(function(repo){
	    $scopt.repository_id = repo[0].repository_id;
	    $scopt.name = push.repo;
	    $scopt.title = repo[0].title;
  		$scopt.description = repo[0].description || '';
			$access.repository_id = repo[0].repository_id;

	    var def = Q.defer();
			var findCommits = mongo.Commit.findOne({ 'repository_id': $access.repository_id, logs: true }).sort({since : -1});
			findCommits.exec(function(err, result){
		    if (err) { def.reject(); }
		    def.resolve(result);
			});
	    return def.promise;
		}).then(function(commit){

	  	if(push.commit === '0000000000000000000000000000000000000000') {
    		RegexCommit = 1;
	    	return event.logBranchRemoved();
	  	} else {
    		let regexLogs = [];
	  		var logFormat = [ '--no-pager', 'log', '--all', `--format=[]%ci%n[]%H%n[]%P%n[]%cn#%ae%n'%B'` ]; 
	  		if(commit) {
	  			let since_date = moment(commit.since).add(1, 'seconds').format(sinceFormat);
	  			logFormat.push(`--since="${since_date}"`);
				}
				// console.log(chalk.yellow('git', logFormat.join(' ')));
	    	return control.cmd('git', logFormat, dirRepository).then(function(logs){
		  		let cmdlogs = logs.match(/\[\][\W\w]*?'[\W\w]*?'/ig);
		    	(cmdlogs || []).forEach(function(item){
		    		// commit logs
		    		regexLogs.push(event.logPushed(item).then(event.folderPrepare));
	    		});

  				RegexCommit = regexLogs.length;
    			return Q.all(regexLogs);
	    	});
	  	}
    }).then(function(){
  		console.log(chalk.green(infoTime), `logs ${RegexCommit} items saved.`, $access.fullname, "push",chalk.green(push.repo, ':', push.branch));
    }).catch(function(ex){
    	console.log(chalk.red(infoTime), chalk.red('catch--logs'), ex);
    });

  });
}
