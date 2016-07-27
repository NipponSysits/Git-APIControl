"use strict";

const express = require('express')();
const http    = require("http").createServer(express);
const moment  = require('moment');
const chalk   = require('chalk');
const config  = require('$custom/config');
const cron    = require('cron');
const async   = require('async-q');
const db      = require("$custom/mysql").connect();

// const io      = require('socket.io').listen(api);
const control = require("$custom/touno-git").control;
const git     = require("./route-git/server");
const api     = require("./route-api/server");

console.log('arg', config.arg);

process.env['PATH'] = process.env['PATH'] + ';' + config.core + ';' + config.lfs
if(!/^6\./.exec(process.versions.node)) {
  console.log('\nNode version is not 6.x.x');
  process.exit()
}

// LISTEN GITSERVER //
git.listen();

// LISTEN APISERVER //
express.use('/api',[], api);
express.get('/', function(req, res){ res.end(); });

http.listen(config.api, function() {
    console.log('API Server is listening on port ' + config.api + ' at ' + moment().format("HH:mm:ss"));
});

// LISTEN SOCKET API //
const io = require( "socket.io" )(http);
io.on('connection', require('./route-io/server'));
 

// Schedule Task Restore //
let items = [], totalGit = 0;
db.select('repositories', { config: 'source' }).then(function(rows){

  // var items = [];
  // rows.forEach(function(row){ items.push(control.create(row)); });
  // return Q.all(items);

  let unbundleProject = function(row){
    let bundleVerify = [ 'bundle','verify', `${config.bundle}/${row.bundle}` ];
    let dir_source = `${config.source}/${row.dir_name}`;

    return control.cmd('git', bundleVerify, dir_source).then(function(msg){
      if(/The bundle records a complete history/g.test(msg)) {
        totalGit++;
        return control.cmd('git', [ 'clone',`${config.bundle}/${row.bundle}`, dir_source, '--bare' ], config.source);
      } else {
        throw {};
      }
    }).catch(function(ex){
      console.log('-- empty repository -- ', row.dir_name);
      console.log(ex.error);
    });
  }

  rows.forEach(function(row){ 
    items.push(function(){ return unbundleProject(row); }); 
  });
  return async.series(items);
}).then(function(results){
  console.log(`Schedule Tasks (${totalGit} of ${items.length}) Successful`); // (${(totalTime/1000).toFixed(2)}s)
}).catch(function(ex){
  console.log(ex);
});


// Schedule Task Backup //
var bundleSchedule = new cron.CronJob('00 30 6,18 * * 1-5', function() {
  var infoTime = moment().format(' HH:mm:ss');
  console.log(chalk.yellow(infoTime), 'Schedule:', new Date(), `Tasks`);

  // let items = [], totalGit = 0;
  // db.select('repositories', { config: 'source' }).then(function(rows){
  //   let bundleProject = function(row){
  //     let bundleCreate = [ 'bundle','create', `${config.bundle}/${row.bundle}` ,'--all' ];
  //     let bundleVerify = [ 'bundle','verify', `${config.bundle}/${row.bundle}` ];
  //     let dir_source = `${config.source}/${row.dir_name}`;

  //     return control.cmd('git', ['branch'], dir_source).then(function(msg){
  //       if(msg.trim() !== '') {
  //         totalGit++;
  //         return control.cmd('git', bundleCreate, dir_source);
  //       } else {
  //         throw undefined;
  //       }
  //     }).catch(function(ex){
  //       if(typeof 'object' == ex) { console.log(row.bundle, '--', ex.error); }
  //     });
  //   }

  //   rows.forEach(function(row){ 
  //     items.push(function(){ return bundleProject(row); }); 
  //   });
  //   return async.series(items);
  // }).then(function(results){
  //   console.log(`Schedule Tasks (${totalGit} of ${items.length}) Successful`); // (${(totalTime/1000).toFixed(2)}s)
  // }).catch(function(ex){
  //   console.log(ex);
  // });
}, null, true);



// let bundle_id = md5(Math.random());
// db.update('repository', { bundle_id: bundle_id }, { repository_id: row.repository_id }).catch(function(ex){
//   console.log('update --', ex);
// });