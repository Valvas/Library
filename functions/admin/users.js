'use strict';

let config = require('../../json/config');

/****************************************************************************************************/

module.exports.getAccountList = function(mysqlConnector, callback)
{
  mysqlConnector.query(`SELECT * FROM ${config['database']['library_database']}.${config['database']['auth_table']}`, function(err, accounts)
  {
    if(err) callback(false);

    else{ callback(accounts); }
  });
};

/****************************************************************************************************/