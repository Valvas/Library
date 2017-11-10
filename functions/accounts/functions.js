'use strict';

let config = require('../../json/config');

/****************************************************************************************************/

module.exports.getUserRightsTowardsService = function(service, account, mysqlConnector, callback)
{
  service == undefined || account == undefined || mysqlConnector == undefined ? callback(false) :

  mysqlConnector.query(`SELECT * FROM ${config['database']['library_database']}.${config['database']['rights_table']} WHERE account = "${account}" AND service = "${service}"`, function(err, rights)
  {
    if(err) callback(false);

    else
    {
      rights.length == 0 ? callback(undefined) : callback(rights[0]);
    }
  });
}

/****************************************************************************************************/