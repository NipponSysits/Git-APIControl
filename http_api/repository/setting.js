"use strict";
var express     = require('express');
var router      = express.Router();

router.get('/create', function(req, res){
	res.end('create');
});

router.get('/delete', function(req, res){
	res.end('delete');
});

router.get('/update', function(req, res){
	res.end('update');
});


module.exports = router;