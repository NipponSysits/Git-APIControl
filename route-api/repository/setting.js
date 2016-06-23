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
  // git show master:readme.md
});

router.get('/branch/:collection/:repository', function(req, res){
  let param = req.params, dir_name = '';
  db.query(sql, { dir: `${param.collection}/${param.repository}` }).then(function(data){
    dir_name = `${config[data[0].config]}/${param.collection}/${param.repository}`;
    return control.cmd('git', [ 'show-branch','--list' ], dir_name)
  }).then(function(branch){
    res.end(JSON.stringify([]));
  }).catch(function(err){
    console.log('repository:', dir_name);
    console.log('branch--catch', err);
    res.end('[]');
  });
});

router.get('/files/:collection/:repository/:branch', function(req, res){
  let param = req.params, dir_name = '', files = [];
  // collection: 'Travox', repository: 'Travox-Crawler.git'
  let sql = `SELECT config FROM repositories WHERE dir_name = :dir`;
  db.query(sql, { dir: `${param.collection}/${param.repository}` }).then(function(data){
    dir_name = `${config[data[0].config]}/${param.collection}/${param.repository}`;
  }).then(function(){
    if(config.platfrom === 'LINUX') {
      return control.cmd('git', [ 'ls-tree','-l',param.branch, '| while read filename; do (echo "$filename|$(git log -1 --format="%ci|%s" -- $filename)") done' ], dir_name);
    } else {
      return control.cmd('cmd', [ '/c', '..\\..\\..\\..\\cmd\\list-files',param.branch ], dir_name);
    }
  }).then(function(git){
    git.match(/(.*)\|(.*)\|(.*)\n/ig).forEach(function(item){
      let logs = /\d{6}(.+)[a-f0-9]{40}([\s\d\-]+)(.*)\|(.*)\|(.*)/ig.exec(item);
      files.push({
        ext: logs[2].trim() === '-' ? null : (/\.[\w\d]+$/gm.exec(logs[3]) || [])[0] || null,
        size: logs[2].trim() === '-' ? 0 : parseInt(logs[2].trim()),
        filename: logs[3],
        since: logs[4],
        comment: logs[5].replace(/\n/g, '')
      });
    });
    res.end(JSON.stringify(files));
  }).catch(function(err){
    console.log('repository:', dir_name);
    console.log('file--catch', err);
    res.end('[]');
  });

});


    
module.exports = router;