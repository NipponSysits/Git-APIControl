const control 	= require("../../libs/control");
const config 		= require("../../app.config");
const auth    	= require("../../libs/auth");
const moment		= require("moment");
const chalk 		= require('chalk');
const path 			= require('path');
const mongoose 	= require('mongoose');

mongoose.connect(config.mongoose);


module.exports = function(push) {
  push.accept(function(){
    var dirRepository = config.path+'/'+push.repo;


		var _ejs = { 
		  commit_index: 22,
		  repository: push.repo,
		  commit_id: push.commit,
		  commit_branch: push.branch,
		  commit_name: '',
		  commit_date: '',
		  comment_head: '',
		  comment_full: '',
		  commit_btn: "Go to commit id '" + push.commit.substr(0, 7) + "'",
		  commit_link: "http://pgm.ns.co.th/"+push.repo+'/info/'+push.commit,
		  domain_name: 'pgm.ns.co.th',
		  limit_rows: 50,
		  files: [ { filename: 'file.txt', status: 'A|M|D', filepath: '/' } ]
		}

		auth.username(push.headers).then(function(user){
      var since_date = "-n 1";

		  _ejs.files = [];
      since_date = '--since="'+since_date+'"';

	    var getTotalList = [ 'rev-list', '--all', '--count' ];
	    var getLogs = [ '--no-pager','log','--pretty=oneline','--all','--source','--stat','--date=iso','--author='+user.email,since_date ];

	    var getHead = [ '--no-pager','show',push.commit,'--pretty=email','--date=iso','--name-status' ]; 
	   	// git --no-pager show 2399b4838c98ed943d85124de58f8eee4ed2a493 
	    // From:(.*)\sDate:(.*)\sSubject: \[PATCH\](.*)\n\n\n
	    // var getFiles = [ '--no-pager','show', push.commit,'--pretty=oneline','--all','--source','--stat','--date=iso','--name-status', since_date, '--author='+user.email ];
	    var getFiles = [ '--no-pager','show',push.commit,'--pretty=oneline','--date=iso','--name-status' ];
	    var getComment = [ 'log','-n 1','--format=%B', '--author='+user.email ]
	    var getGraph = [ '--no-pager', 'log', '--all', '--graph', '--oneline', since_date ];
	    // git --no-pager show 2399b4838c98ed943d85124de58f8eee4ed2a493 --pretty=email --all --source --stat --date=iso --name-status -n 4
			_ejs.commit_name = user.fullname+'<'+user.email+'>';

    	console.log(user.username, "("+user.fullname+")", 'push /' + push.repo, ':', push.branch);
    	return control.cmd('git', getTotalList, dirRepository);
    }).then(function(index){
    	_ejs.commit_index = index.replace(/[\n|\r]/g,'');

    	return control.cmd('git', getLogs, dirRepository);
    }).then(function(log){	


      var sinceFormat = "yyyy-MM-dd HH:mm:ss zzz";
    	var head = /Author:.(.*?>)\W+Date:.(.*)/.exec(log);
    	var note = /\n\n([\S|\s]+)\n\n\w/.exec(log)[1];
		  _ejs.author_name = head[1],
		  _ejs.commit_date = moment(head[2], sinceFormat).format('MMMM DD, YYYY HH:mm:ss'),
		  _ejs.comment_head = note.trim().substr(0, 50);
		  _ejs.comment_full = note.trim();
		  var fileRegex = /[D|A|M][\t|\s]+.*/g;
		  log.match(fileRegex).forEach(function(file){
		  	file = /([D|A|M])[\t|\s]+(.*)/g.exec(file);
		  	var name = path.basename(file[2]);
		  	_ejs.files.push({
		  		filename: name.substr(0, 30)+(name.length > 30 ? '...'+path.extname(file[2]) : ''), 
		  		status: file[1], 
		  		filepath: path.dirname('/'+file[2]) 
		  	});
		  });

  	if(push.commit === '0000000000000000000000000000000000000000') {
  		// Delete Branch in Origin
    	console.log(chalk.red('delete branch', push.branch, 'on remote.'));
  	} else {
    	return control.changeset(data, push);
  	}

    }).catch(function(ex){
    	console.log(chalk.red('event--push', ex));
    });

  });
}
