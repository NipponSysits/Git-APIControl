const config 	= require("../app.config");
const conn 		= require("./db");
const auth 		= require("./auth");
const db 			= conn.connect();

const repos 	= require('pushover')(config.path, { autoCreate: false });
const Q 			= require('q');
const spawn 	= require('child_process').spawn;
const chalk 	= require('chalk');

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport(config.smtp);
const path = require('path');
const EmailTemplate = require('email-templates').EmailTemplate;

var onexit = function (ps, cb) {
  var pending = 3;
  var code, sig;
  
  function onend () {
      if (--pending === 0) cb(code, sig);
  }
  ps.on('exit', function (c, s) {
      code = c;
      sig = s;
  });
  ps.on('exit', onend);
  ps.stdout.on('end', onend);
  ps.stderr.on('end', onend);
};

module.exports = {
	cmd: function(command, parameter, dir) {
    var def = Q.defer(), ps = spawn(command, parameter || [], { cwd : dir } || {});
    var err = '', out = '';
    ps.stdout.on('data', function (buf) { out += buf; });
    ps.stderr.on('data', function (buf) { err += buf; });
    onexit(ps, function (code) { 
    	if(code != 0)  { def.reject({ code: code, error: err }); } else { def.resolve(out); }
    });
    return def.promise;
	},
	email: function(template_name, options, data, req){
  	var def = Q.defer();
		try {
			var changeset = new EmailTemplate(path.join(__dirname, '../templates', template_name));
		} catch(ex) {
			console.log(ex);
			def.reject({ error: ex.toString() });
		}

		changeset.render(data, function (err, result) {
		  if(err) { def.reject({ error: err }); }
		  options = options || {};

		  var scopt = {}
		  var mailOptions = { 
		  	from: 'pgm@ns.co.th', 
		  	to: options.to || [], 
		  	cc: options.cc || [], 
		  	bcc: options.bcc || [], 
		  	text: result.text, 
		  	html: result.html 
		  };

		  auth.username(req.headers).then(function(user){
		  	scopt.user = user;
		    return db.selectOne('permission', { url: req.repo });
		  }).then(function(r){
	  		scopt.notify = r.notify == 'YES' ? true : false;
	  		scopt.repository_id = r.repository_id;

		  	if(scopt.notify) {
	  			var sql = "SELECT u.email FROM repository_role r JOIN user u ON r.user_id = u.user_id " 
									+ "WHERE (r.permission = 'Administrators' OR r.permission = 'Subscribe') AND r.repository_id = :repository_id";

			  	return db.query(sql, { repository_id: r.repository_id }).then(function(u){
			  		var mail_to = mailOptions.to.join('|');
			  		u.forEach(function(user){ 
			  			if(mail_to.indexOf(user.email) < 0 && mailOptions.cc.join('|').indexOf(user.email) < 0) {
			  				mailOptions.cc.push(user.email);
			  			}
			  		});

			  		return db.query("SELECT email FROM user_access WHERE level < 2", {});
			  	}).then(function(u){
			  		var mail_to = mailOptions.to.join('|');
			  		var mail_cc = mailOptions.cc.join('|');
			  		u.forEach(function(user){ 
			  			if((mail_to+'|'+mail_cc).indexOf(user.email) < 0 && mailOptions.bcc.join('|').indexOf(user.email) < 0) {
			  				mailOptions.bcc.push(user.email);
			  			}
			  		});
			  	}).catch(function(ex){
		  			def.reject({ error: ex.toString() });
				  });
				} else {
		  		def.resolve();
				}
		  }).then(function(u){
		  	if(scopt.notify) {
			  	mailOptions.subject = scopt.user.fullname+" push '"+req.repo.replace(/\.git$/g, '')+"'"

				  transporter.sendMail(mailOptions, function(err, info){
				    if(err) {
				    	def.reject({ error: err });
				    } else {
					    var status = /\<(.*?)\>\s?\[InternalId=(\d+)\]\s?(.*)/g.exec(info.response);
					    console.log(chalk.green.bold('[ Message:', status[3], ']'));
					    console.log(chalk.green('Id', status[2], '--', status[1]));
				    	def.resolve();
				    }

				  });
		  	} else {
		  		def.resolve();
		  	}
		  }).catch(function(ex){
		  	console.log(ex);
		  	def.reject({ error: ex.toString() });
		  });
		});
  	return def.promise;
	},
	forgot: function(data, user){

	},
	create: function(path){
    var def = Q.defer();
		repos.exists(path, function(exists){
			if(!exists) {
				repos.create(path, function(err){
					if(err) { def.reject(err); } else { def.resolve(false); }
				});
			} else {
    		def.resolve(true);
			}
		})
    return def.promise;
	}
}