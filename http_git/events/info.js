const auth    = require("$custom/touno-git").auth;
const moment  = require("moment");
const chalk   = require('chalk');


module.exports = function(info) {
  let repo = info.repo.replace(/\//g, ' -> ').replace(/\.git/g, ' project.');
  auth.username(info.headers).then(function(user){
    return auth.permission(info.repo, user).then(function(permission){
      var infoTime = moment().format(' HH:mm:ss');
      if(permission.accept) {
        console.log(chalk.yellow(infoTime), "logs", user.fullname, "info", repo);
        info.accept();
      } else {
        console.log(chalk.red(infoTime), chalk.red('reject'), user.fullname, info.repo, permission.error);
        info.reject();//'Please check username and password is not currect'
      }
    });
  }).catch(function(ex){
    console.log(chalk.red(infoTime), chalk.red('catch--info'), ex);
  });
}