const config = require('.custom/config');
const socket = require('.custom/socket').clent;

socket.on('connect', function(){
	console.log('client connecting.');
});
socket.on('disconnect', function(){
	console.log('client disconnect.');
});


socket.emit('client checkin', { some: 'checkin' });
socket.emit('client checkout', { some: 'checkout' });
console.log('client',config.domain+':'+config.api);