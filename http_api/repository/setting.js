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

router.get('/files/:collection/:repository', function(req, res){
  let param = req.params, dir_name = '';
  // collection: 'Travox', repository: 'Travox-Crawler.git'
  let sql = `SELECT config FROM repositories WHERE dir_name = :dir`;
  db.query(sql, { dir: `${param.collection}/${param.repository}` }).then(function(data){
    dir_name = `${config[data[0].config]}/${param.collection}/${param.repository}`;
    return control.cmd('git', [ 'ls-tree','--name-only','--full-tree', 'master' ], dir_name);
  }).then(function(git){
    git.match(/.*\n/ig).forEach(function(item){
      console.log('file', /\./ig.test(item), item);
    });
    res.end(JSON.stringify({}));
  }).catch(function(err){
    console.log('repository:', dir_name);
    console.log('file--catch', err);
    res.end('{}');
   });

});


    
module.exports = router;