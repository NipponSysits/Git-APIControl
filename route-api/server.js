"use strict";

const Q         = require('q');
const fs 				= require('fs');
const md5       = require('md5');
const readline 	= require('readline');
const db 				= require("$custom/mysql").connect();
const request 	= require('request');
const express   = require('express');
const router    = express.Router();

router.use('/repository', [], require('./repository/setting'));



db.query(`SELECT email FROM user_email`).then(function(data){
	let download = [], total = 0, current = 0;

	let reqGravatar = function(size, id){
		var def = Q.defer();
		let url = `http://www.gravatar.com/avatar/${id}?d=mm&s=${size}`;
		request.head(url, function(err, res, body){
			var dir = __dirname+`/../asset/gravatar/${size}/`;
			if(!fs.existsSync(dir)) { fs.mkdirSync(dir); }
			let writer = request(url).pipe(fs.createWriteStream(`${dir}${id}.png`));

			writer.on('finish', () => { 
				readline.clearLine(process.stdout);
    		readline.cursorTo(process.stdout, 0);
				process.stdout.write(`[Gravatar.com] Avatar downloading... ${((current*100)/(total*4)).toFixed(2)}% (${current}/${(total*4)})`); 
				current++; 
				def.resolve(); 
			});
			writer.on('error', () => {
				console.log(`error ${size} '${id}.png`); 
			});
		});
		return def.promise;
	}

	total = data.length;
	data.forEach(function(item) {
		let id = md5(item.email);
		download.push(reqGravatar(32, id));
		download.push(reqGravatar(64, id));
		download.push(reqGravatar(128, id));
		download.push(reqGravatar(256, id));
	});

	return Q.all(download);
}).then(function(){
	readline.clearLine(process.stdout);
	readline.cursorTo(process.stdout, 0);
	process.stdout.write(`[Gravatar.com] Successful.\n\r`); 
}).catch(function(ex){
	console.log('Gravatar download fail.');
	console.log('ex', ex);
});

module.exports = router;