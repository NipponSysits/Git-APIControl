const moment   = require('moment');
const chalk    = require('chalk');
const config   = require('$custom/config');
const mongo    = require("$custom/schema");
const db       = require("$custom/mysql").connect();
const async    = require('async-q');
const Q        = require('q');

const touno    = mongo.DB('touno-k');

let dbTasks = [], objTasks = [];
let rowRepository = function(row){
  let obj = { 
    '_type': 'debugerr:repository',
    'object': {
      repository_id: row.repository_id
    }
  }
  touno.findOne(obj).exec(function(err, result){
    if(result) {
      obj.object = row;
      new touno(obj).save(function(){ })

      objTasks.push();
    } else {
      touno.update(obj, { $set: { object: row } }, callback);
    }
  });
}


module.exports = function(socket) {

  dbTasks.push(function(){
    return db.select('repository', {}).then(function(rows){
      // let def = Q.defer();

      rows.forEach(rowRepository);
      // def.resolve();
      // return def.promise;
    })
  });

  async.series(dbTasks).then(function(results){
    console.log(`async ${dbTasks.length} Tasks Successful.`);
    return async.series(all)
  });

  return;
}