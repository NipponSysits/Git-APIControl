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
  console.log(req.params);
	res.end('files');
    // let sql = `SELECT dir_name, config FROM repositories WHERE repository_id = :repository_id`;
    // db.query(sql, data).then(function(data){
    //   let args = [ 'ls-tree','--name-only','--full-tree','-r', 'master'];
    //   dir_name = `${config[data[0].config]}/${data[0].dir_name}`;
    //   return control.cmd('git', args, dir_name);
    // }).then(function(git){
    //   console.log(git);
    //   socket.emit('repository-file', 0);
    // }).catch(function(err){
    //   console.log('repository:', dir_name);
    //   console.log('file--catch', err);
    //   socket.emit('repository-file', []);
    // });


});


    
module.exports = router;