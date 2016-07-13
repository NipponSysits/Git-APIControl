"use strict";

const config = require('$custom/config');
const socket = require('$custom/sentinel').clent();

socket.on('connect', function(){
	console.log('client connecting.');
});
socket.on('disconnect', function(){
	console.log('client disconnect.');
});