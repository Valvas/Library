'use strict'

const mysql       = require('mysql');
const errors      = require(`${__root}/json/errors`);
const constants   = require(`${__root}/functions/constants`);

/****************************************************************************************************/

module.exports.checkAccessToDatabase = (databaseObject, callback) =>
{
  if(databaseObject.dbms == 'MySQL')
  {
    mysqlDatabase(databaseObject, (error) =>
    {
      callback(error);
    });
  }
}

/****************************************************************************************************/

function mysqlDatabase(databaseObject, callback)
{
  var databaseCounterRetries = 0;
      
  var databaseConnectionLoop = () =>
  {
    databaseConnector = mysql.createConnection(
    {
      host     : databaseObject.host,
      user     : databaseObject.user,
      port     : databaseObject.port,
      password : databaseObject.password
    });

    databaseConnector.connect((err) =>
    {
      databaseCounterRetries += 1;
      
      if(databaseCounterRetries < 10 && err) setTimeout(() =>{ databaseConnectionLoop(); }, 1000);
      
      else if(databaseCounterRetries == 10 && err) callback({ status: 500, message: errors[constants.UNABLE_TO_CONNECT_TO_DATABASE] });

      else{ callback(null); }
    });
  }
      
  databaseConnectionLoop();
}

/****************************************************************************************************/