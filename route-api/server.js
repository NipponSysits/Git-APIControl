"use strict";

const Q         = require('q');
const fs 				= require('fs');
const md5       = require('md5');
const db 				= require("$custom/mysql").connect();
const request 	= require('request');
const express   = require('express');
const router    = express.Router();

router.use('/repository', [], require('./repository/setting'));

let reqGravatar = function(size, id){
	var def = Q.defer();
	let url = `http://www.gravatar.com/avatar/${id}?d=mm&s=${size}`;
	request.head(url, function(err, res, body){
		var dir = __dirname+`/../asset/gravatar/${size}/`;
		if(!fs.existsSync(dir)) { fs.mkdirSync(dir); }
		let writer = request(url).pipe(fs.createWriteStream(`${dir}${id}.png`));

		writer.on('finish', () => { console.log(`createWriteStream  /gravatar/${size}/${id}.png'`);  def.resolve(); });
		writer.on('error', () => {
			console.log(`error ${size} '${id}.png'`); 
		});
	});
	return def.promise;
}

db.query(`SELECT email FROM user_email`).then(function(data){
	let download = [];
	data.forEach(function(item) {
		let id = md5(item.email);
		download.push(reqGravatar(32, id));
		download.push(reqGravatar(64, id));
		download.push(reqGravatar(128, id));
		download.push(reqGravatar(256, id));
	});

	return Q.all(download);
}).then(function(){
	console.log('Gravatar Images download successful.');
}).catch(function(ex){
	console.log('Gravatar download fail.');
	console.log('ex', ex);
});

module.exports = router;