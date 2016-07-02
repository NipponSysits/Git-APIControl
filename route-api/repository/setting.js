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

router.get('/files/:collection/:repository/:branch', function(req, res){

});


    
module.exports = router;