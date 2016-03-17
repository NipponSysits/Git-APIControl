var q = require('q');
var mysql = require('mysql');
var mysqlWrap = require('mysql-wrap');
var config = require('../app.config');
var pool = {};

module.exports = {
  connect: function(cn) {
    cn = cn || {};
    pool = mysql.createPool({
      connectionLimit: cn.connLimit || config.mysql.connLimit || 10000,
      host: cn.host || config.mysql.host || 'localhost',
      port: cn.port || config.mysql.port || 3306,
      database: cn.database || config.mysql.database || 'mysql',
      user: cn.user || config.mysql.user || 'root',
      password: cn.password || config.mysql.password || '',
      debug: cn.debug || config.mysql.debug || false,
      supportBigNumbers: true,
      timezone:'+7:00',
      dateStrings:true,
      queryFormat: function (query, values) {
        if (!values) {
          return query;
        }
        return query.replace(/\:(\w+)/g, function (txt, key) {
          if (values.hasOwnProperty(key)) {
            return this.escape(values[key]);
          }
          return txt;
        }.bind(this));
      }
    });
    return mysqlWrap(pool);
  }
}
