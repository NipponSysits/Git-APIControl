"use strict";

const async = require('async-q');
const Q 		= require('q');

var all = [], totalTime = 0;
var callFunc = function(id){
	var def = Q.defer();
	var time = parseInt(Math.random() * 2000);
	totalTime += time;
	console.log(`Tasks-${id} Begin...`);
	
	setTimeout(function(){ 
		console.log(`Tasks-${id} Successful in ${(time/1000).toFixed(2)}s`); 
		def.resolve();
	}, time);
	
	return def.promise;
}

for (var i = 0; i < 100; i++) { all.push(callFunc.bind(this, i)); }
async.series(all).then(function(results){
	console.log(`Total ${all.length} Tasks Successful (${(totalTime/1000).toFixed(2)}s)`); 
});
