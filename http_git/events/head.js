const moment    = require("moment");
const chalk   = require('chalk');

module.exports = function(head) {
  var infoTime = moment().format('HH:mm:ss, dddd');
  console.log(chalk.yellow(infoTime), 'head ' + head.repo);
  head.accept();
}