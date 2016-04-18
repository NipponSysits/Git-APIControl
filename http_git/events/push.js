const config  = require(".custom/config");
const control = require(".custom/touno-git").control;
const auth 		= require(".custom/touno-git").auth;
const mongo 		= require(".custom/touno-db").mongo;
const db 				= require(".custom/touno-db").mysql.connect();
const moment		= require("moment");
const chalk 		= require('chalk');
const path 			= require('path');

module.exports = function(push) {
  push.accept(function(){
    var dirRepository = config.path+'/'+push.repo;
    var sinceFormat = 'ddd, D MMM YYYY HH:mm:ss ZZ';
    var _option = { to: [] }
		var _ejs = { 
		  commit_index: 22,
		  repository: push.repo,
		  commit_id: push.commit,
		  commit_branch: push.branch,
		  commit_name: '',
		  commit_date: '',
		  comment_subject: '',
		  comment_full: '',
		  commit_btn: "Go to commit id '" + push.commit.substr(0, 7) + "'",
		  commit_link: "http://pgm.ns.co.th/"+push.repo+'/info/'+push.commit,
		  domain_name: 'pgm.ns.co.th',
		  limit_rows: 50,
		  files: [],
		  width_icon: 0,
		  width_detail: 680,
		  graph: []
		}

		auth.username(push.headers).then(function(user){
	    var getTotalList = [ 'rev-list', '--all', '--count' ];
	    var getHead = [ '--no-pager','show',push.commit,'--pretty=email','--date=iso','--name-status' ]; 
	   	// git --no-pager show 2399b4838c98ed943d85124de58f8eee4ed2a493 
	    // From:(.*)\sDate:(.*)\sSubject: \[PATCH\](.*)\n\n\n
	    // var getFiles = [ '--no-pager','show', push.commit,'--pretty=oneline','--all','--source','--stat','--date=iso','--name-status', since_date, '--author='+user.email ];
	    // var getFiles = [ '--no-pager','show',push.commit,'--pretty=oneline','--date=iso','--name-status' ];
	    // var getComment = [ 'log','-n 1','--format=%B', '--author='+user.email ]
	    // git --no-pager show 2399b4838c98ed943d85124de58f8eee4ed2a493 --pretty=email --all --source --stat --date=iso --name-status -n 4

    	console.log(user.username, "("+user.fullname+")", chalk.green('push /' + push.repo, ':', push.branch));
			// console.log(chalk.yellow('git', getTotalList.join(' ')));
    	return control.cmd('git', getTotalList, dirRepository).then(function(index){
	    	_ejs.commit_index = index.replace(/[\n|\r]/g,'');
  			// console.log(chalk.yellow('git', getHead.join(' ')));
	    	return control.cmd('git', getHead, dirRepository);
	    }).then(function(logs){
	    	var logHead = /From:.(.*?)\nDate:.(.*)\nSubject:.\[PATCH\].([\S|\s]*)?\n\n/g.exec(logs);
	    	var email = /(.*)\<(.*)\>/g.exec(logHead[1]);

	    	_option.to.push(user.email);
	    	if(email[2] !== user.email) _option.to.push(email[2]);


	    	var dateAt = moment(logHead[2], sinceFormat);
	    	console.log(dateAt.format('dddd, DD MMMM YYYY')); // Sat, 9 Apr 2016 14:33:47 +0700
	    	console.log(dateAt.format('HH:mm:ss')); // Sat, 9 Apr 2016 14:33:47 +0700

	    	var logLimit = 0;
	    	var logChange = /\n\n([AMD]\s[\S\s]+)/g.exec(logs) || [];

	    	_ejs.comment_full = logHead[3];
				_ejs.comment_subject = ((/(.*)\n\n/g.exec(logHead[3]) || ['', logHead[3]])[1]).substr(0, 36)
	    	_ejs.commit_date = dateAt.format('dddd, DD MMMM YYYY HH:mm:ss');
				_ejs.commit_name = email[0];
	    	_ejs.files = (logChange[1] || []).split(/\n/).map(function(file){
	    		file = /([AMD])\s+(.*)/g.exec(file);
	    		if(file) {
				  	var name = path.basename(file[2]) || '';
				  	if(_ejs.limit_rows > logLimit) {
				  		logLimit++;
			    		return { 
			    			class: 'item-one',
			    			filename: name.substr(0, 30)+(name.length > 30 ? '...'+path.extname(file[2]) : ''), 
			    			status: file[1]=='A'?'+':file[1]=='D'?'-':'', 
			    			filepath: path.dirname('/'+file[2])
			    		}
				  	} else {
				  		return;
				  	}
	    		}
	    	}).filter(function(list){ if(list) { return list; } });

	    	var commiter = {
	    		user_id: user.user_id,
	    		repository: push.repo
	    	}
	    	return mongo.commiter.select(commiter.user_id, commiter.repository).then(function(commit){
	      	var since_date = "-n 1";
	    		if(commit) {
	    			var since = moment(commit.since, sinceFormat).add(1, 'seconds').format(sinceFormat);
	    			since_date = '--since="'+since+'"';
	    		}
	    		var getLogs = [ '--no-pager','log','--graph','--abbrev-commit','--pretty=oneline','--all','--author='+email[0].trim(), since_date ];
    			// console.log(chalk.yellow('git', getLogs.join(' ')));
    			return mongo.commiter.update(commiter.user_id, commiter.repository, logHead[2]).then(function(){
    				return control.cmd('git', getLogs, dirRepository);
    			});
	    	});
	    });
    }).then(function(logs){
    	logs = logs.match(/[0-9a-f]+..*/g);
	  	if(push.commit === '0000000000000000000000000000000000000000') {
	   		return control.email('changeset-branch', _option, _ejs, push);
	    } else if(logs.length > 1) {

	    	var getGraph = [ '--no-pager','log','--graph','--all','--format=%H[--]%ae[--]%s[--]%ai','-n '+logs.length ];
	    	return control.cmd('git', getGraph, dirRepository).then(function(logs){
	    		var maxImg = 0, logHistory = logs.split(/\n/g);
	    		logHistory.forEach(function(log){
	    			var graph = /([*\/\\| ]{2,100})/g.exec(log);
	    			var commit = /([0-9a-f]{40})\[--\](.*)\[--\](.*)\[--\](.*)/g.exec(log);
	    			var td_object = { icon: [], detail: '' };
	    			if(commit) {
	    				td_object.detail = commit[3];
		    			console.log('graph', graph[1]);
		    			console.log('comit_id', commit[1]);
		    			console.log('email', commit[2]);
		    			console.log('comment', commit[3]);
		    			console.log('date', commit[4]);
		    			for (var i = 0; i < graph.length; i++) {
		    				var icon = 'space';
		    				switch(graph[i])
		    				{
		    					case '*': icon = 'point'; break;
		    					case '|': icon = 'center'; break;
		    					case '\\': icon = 'left'; break;
		    					case '/': icon = 'right'; break;
		    				}
		    				td_object.icon.push('http://pgm.ns.co.th/graph/' + icon + '.jpg');
		    			}
		    			maxImg = graph.length > maxImg ? graph.length : maxImg;
		    			_ejs.width_icon = maxImg*9;
	    			}
	    			_ejs.graph.push(td_object)
	    		});
	    		_ejs.commit_index = (parseInt(_ejs.commit_index) - logHistory.length) + ' - ' + _ejs.commit_index
    			_ejs.width_detail = _ejs.width_detail - _ejs.width_icon;
	   			return control.email('changeset-logs', _option, _ejs, push);
	    	});
	  	} else {
	   		return control.email('changeset-email', _option, _ejs, push);
	  	}
    }).catch(function(ex){
    	console.log(chalk.red('event--push'), ex);
    });

  });
}
