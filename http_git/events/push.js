var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport();
var EmailTemplate = require('email-templates').EmailTemplate;
var path = require('path');
var changeset = new EmailTemplate(path.join(__dirname, '../../templates', 'changeset-email'));
var spawn = require('child_process').spawn;
var config 	= require("../../app.config");


var transporter = nodemailer.createTransport({
  host: '192.168.10.2',
  port: 25,
  auth: {
    user: 'pgm',
    pass: '123456'
  },            
  secure:false,
  tls: { rejectUnauthorized: false },
  debug:true
});

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

module.exports = function(push) {
  push.accept(function(){ 
    console.log('push ' + push.repo + '/' + push.commit + ' (' + push.branch + ')');
    var ps = spawn('git', [ 'rev-list', '--all', '--count' ], { cwd : config.path + '/' + push.repo });
    
    var err = '', out = '';
    ps.stdout.on('data', function (buf) { 
    	console.log('data', buf);
      out += buf;
    });
    ps.stderr.on('data', function (buf) { 
        err += buf;
    });
    console.log(ps);
    onexit(ps, function (code) {
    	if(code != 0) {
    		console.log('----------------------------');
    		console.log(err);
    		console.log('----------------------------');
    	}
    	console.log('code', code, 'output', out.toString());
    });


		var data = { 
		  avatar: 'c1ec9de8190fa568a2bd87b7713a7c57',
		  password: '123456',
		  commit_index: 22,
		  repository: push.repo,
		  parents: null,
		  commit_id: push.commit,
		  commit_branch: push.branch,
		  commit_name: 'Kananek T. <kem@ns.co.th>',
		  commit_date: 'March 30, 2016 11:18:21',
		  comment_head: 'asdasdasd asd asd as das dasd asd sad asd as',
		  comment_full: 'asdasdasd asd asd as \n \n sdasdasdasdasdasd',
		  commit_btn: "Go to commit id '95be516'",
		  domain_name: 'pgm.ns.co.th',
		  limit_rows: 50,
		  files: [
		    { filename: 'dfgnwexwsd1.txt', status: '+', filepath: '/temp/test-mail/node_modules/async/support' },
		    { filename: 'dfgnwexwsd2.txt', status: '+', filepath: '/temp/test-mail/node_modules/async/tmp' },
		    { filename: 'dfgnwexwsd2.txt', status: '+', filepath: '/temp/test-mail/node_modules/async/tmp' },
		    { filename: 'dfgnwexwsd2.txt', status: '+', filepath: '/temp/test-mail/node_modules/async/tmp' }
		  ]
		}

		changeset.render(data, function (err, result) {
		  if(err) return console.log('render', err);

		  var mailOptions = {
		    from: 'pgm@ns.co.th', // sender address
		    to: 'kem@ns.co.th', // list of receivers
		    subject: "Kananek T. push 'test-template' project.", // Subject line
		    text: result.text, // plaintext body
		    html: result.html // html body
		  };

		  // send mail with defined transport object
		  transporter.sendMail(mailOptions, function(error, info){
		    if(error) return console.log(error);
		    var status = /\<(.*?)\>\s?\[InternalId=(\d+)\]\s?(.*)/g.exec(info.response);
		    console.log('[ Message:', status[3], ']');
		    console.log('Id', status[2], '-', status[1]);
		  });

		});
  });
}
