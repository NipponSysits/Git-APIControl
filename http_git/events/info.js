const auth    = require(".custom/touno-git").auth;
const moment    = require("moment");
const chalk   = require('chalk');


module.exports = function(info) {
  auth.username(info.headers).then(function(user){
    return auth.permission(info.repo, user).then(function(permission){
      if(permission.accept) {
        console.log(chalk.yellow('verify'), moment().format('dddd, HH:mm:ss'), user.username, "("+user.fullname+")");
        info.accept();
      } else {
        console.log(chalk.red('reject'), moment().format('dddd, HH:mm:ss'), user.username, info.repo);
        console.log(chalk.red('msg --'), permission.error);
        info.reject();//'Please check username and password is not currect'
      }
    });
  }).catch(function(ex){
    console.log(chalk.red('event--info'), ex);
  });
}