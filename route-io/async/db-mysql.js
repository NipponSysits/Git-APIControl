const moment   = require('moment');
const chalk    = require('chalk');
const config   = require('$custom/config');
const mongo    = require("$custom/schema").DB('touno-k');
const db       = require("$custom/mysql").connect();
const control  = require("$custom/touno-git").control;
const async    = require('async-q');
const Q        = require('q');

let dbname = 'debugerr';
module.exports = function() {
  let dbTasks = [], objTasks = [], repos = [], totalGit = 0;
  let sql = `
  SELECT TABLE_NAME name FROM information_schema.tables
  WHERE TABLE_SCHEMA='${dbname}' AND TABLE_TYPE='BASE TABLE'
  `;
  db.query(sql, {}).then(function(rows){
    rows.forEach(function (table) {
      dbTasks.push(function(){
        return mongo.delete({ '_table': table.name });
      });
      dbTasks.push(function(){
        return db.select(table.name, {}).then(function(rows){
          let queue = rows.map(function(row){ return mongo.insert({ _table: table.name, _get:row });  });
          return Q.all(queue);
        })
      });
    });

  }).then(function(){
    console.log(`Tasks [sync] -- database mysql.`);
    return async.series(dbTasks);
  }).then(function(){
    console.log(`Tasks [sync] -- tables ${dbTasks.length / 2} successful.`);
    return db.select('repositories', { config: 'source' }).then(function(rows){
      repos = rows.map(function(row){ return control.create(row).then(function(found){ if(!found) { totalGit++; } }); });
      return Q.all(repos);

      // let unbundleProject = function(row){
      //   let dir_source = `${config.source}/${row.dir_name}`;
      //   let bundleClone = ['clone',`${config.bundle}/${row.bundle}`,dir_source,'--bare']

      //   return control.cmd('git', [ 'bundle','verify', `${row.bundle}` ], config.bundle).then(function(msg){
      //     if(/The bundle records a complete history/g.test(msg)) {
      //       totalGit++;
      //       return control.cmd('git', bundleClone, config.source);
      //     } else {
      //       throw {};
      //     }
      //   }).catch(function(ex){
      //     console.log('-- empty repository -- ', row.dir_name);
      //     console.log(ex.error);
      //   });
      // }

      // rows.forEach(function(row){ 
      //   items.push(function(){ return unbundleProject(row); }); 
      // });
      // return async.series(items);
    });

  }).then(function(){
    console.log(`Tasks [git] -- Create folder (${totalGit} of ${repos.length}) Successful`); // (${(totalTime/1000).toFixed(2)}s)

    return async.series(objTasks)
  }).then(function(){
    console.log(`Tasks [git] -- commits checkout ${objTasks.length} Successful.`);
  }).catch(function(ex){
    console.log('catch --',ex);
  });

  return;
}