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

//0 -> error, 1 -> account not found, 2 -> not admin, 3 -> admin

module.exports.checkIfUserIsAdmin = function(account, mysqlConnector, callback)
{
  mysqlConnector.query(`SELECT * FROM ${config['database']['library_database']}.${config['database']['auth_table']} WHERE email = "${account}"`, function(err, result)
  {
    if(err){ callback(0); }

    else if(result.length == 0) callback(1);

    else{ result[0]['is_admin'] == 0 ? callback(2) : callback(3); }
  });
}

/****************************************************************************************************/