"use strict";

const express = require('express');
const router  = express.Router();
const moment  = require('moment');
const config  = require('$custom/config');
const control = require("$custom/touno-git").control;
const db      = require("$custom/mysql").connect();

router.get('/create', function(req, res){
  res.end('create');
});

router.get('/delete', function(req, res){
  res.end('delete');
});

router.get('/update', function(req, res){
  res.end('update');
});

router.get('/files/:collection/:repository/:branch', function(req, res){
  let param = req.params, dir_name = '', files = [];
  // collection: 'Travox', repository: 'Travox-Crawler.git'
  let sql = `SELECT config FROM repositories WHERE dir_name = :dir`;
  db.query(sql, { dir: `${param.collection}/${param.repository}` }).then(function(data){
    dir_name = `${config[data[0].config]}/${param.collection}/${param.repository}`;
  }).then(function(){
    	// LINUX  :: git ls-tree --name-only master | while read filename; do (echo "$filename|$(git log -1 --format="%ci|%s" -- $filename)") done
    	// WINDOW :: 

			// git ls-tree --full-tree master
			// git show-branch --list

			// git show master:readme.md
    if(config.platfrom === 'LINUX') {
      return control.cmd('git', [ 'ls-tree','--name-only',param.branch, '| while read filename; do (echo "$filename|$(git log -1 --format="%ci|%s" -- $filename)") done' ], dir_name);
    } else {
      return control.cmd('cmd', [ '/c', '..\\..\\..\\..\\cmd\\list-files',param.branch ], dir_name);
    }
  }).then(function(git){
    git.match(/(.*)\|(.*)\|(.*)\n/ig).forEach(function(item){
      let logs = /(.*)\|(.*)\|(.*)/ig.exec(item);
      let file = {
        ext: (/\.[\w\d]+$/gm.exec(logs[1]) || [])[0] || null,
        filename: logs[1],
        since: logs[2],
        comment: logs[3].replace(/\n/g, '')
      }

      files.push(file);
    });
    res.end(JSON.stringify(files));
  }).catch(function(err){
    console.log('repository:', dir_name);
    console.log('file--catch', err);
    res.end('[]');
   });

});


    
module.exports = router;