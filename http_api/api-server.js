var express     = require('express');
var router      = express.Router();

router.use('/repository', [], require('./repository/setting'));


module.exports = router;