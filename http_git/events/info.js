const auth    = require("../../libs/auth");
const chalk   = require('chalk');


module.exports = function(info) {
  auth.username(info.headers).then(function(user){
    // console.log('info check', user.level);
    if(user.level > 0) {
      auth.permission(info.repo, user).then(function(accept){
        // console.log('accept', accept);
        if(accept) {
          console.log(user.username, "("+user.fullname+")",'info /'+info.repo);
          info.accept();
        } else {
          console.log(chalk.red('reject--'+info.headers,'/'+info.repo));
          info.reject('Please check username and password is not currect');
        }
      });
    } else {
      console.log(user.username, "("+user.fullname+")",'info /'+info.repo);
      info.accept();
    }
  });
}