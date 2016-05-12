"use strict";
const moment    = require("moment");
const chalk   	= require('chalk');

module.exports = function(tag) {
  var infoTime = moment().format('HH:mm:ss, dddd');
  if(typeof tag.commit != 'undefined') {
	  console.log(chalk.yellow(infoTime), 'tag ' + tag.repo);
  }
  tag.accept();
}