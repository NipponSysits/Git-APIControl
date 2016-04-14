const config = require('.custom/config');
const socket = require('.custom/socket').clent;

socket.on('connect', function(){
	console.log('connect');

	socket.emit('an event', { some: 'data' })
});

socket.on('disconnect', function(){
	console.log('disconnect');
});
console.log('client',config.domain+':'+config.api);