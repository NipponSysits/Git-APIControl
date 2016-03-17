var Service = require('node-windows').Service;

var svc = new Service({
  name:'PGM-Control',
  description: 'Source Control HTTP Server',
  script: require('path').join(__dirname, 'app.js')
  // , env: [
  //   {
  //     name: "HOME",
  //     value: process.env["USERPROFILE"] // service is now able to access the user who created its' home directory
  //   },
  //   {
  //     name: "TEMP",
  //     value: path.join(process.env["USERPROFILE"],"/temp") // use a temp directory in user's home directory
  //   }
  // ]
});

svc.on('install',function(e){
  console.log(e);
  console.log('Service install sucessfully');
  svc.start();
});

svc.on('start', function() {
  console.log('Service starting');
});
svc.on('stop', function() {
  console.log('Service stoping');
});

// svc.user.domain = 'mydomain.local';
// svc.user.account = 'username';
// svc.user.password = 'password';
// svc.sudo.password = 'password';

svc.install();
// svc.uninstall();
