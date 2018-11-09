'use strict'

const mysql       = require('mysql');
const constants   = require(`${__root}/functions/constants`);

/****************************************************************************************************/

module.exports.checkAccessToDatabase = (databaseObject, callback) =>
{
  switch(databaseObject.dbms)
  {
    case 'mysql':
      mysqlDatabase(databaseObject, (error) => { return callback(error) });
      break;

    default:
      return callback({ status: 406, code: constants.DBMS_NOT_FOUND, detail: null });
  }
}

/****************************************************************************************************/

function mysqlDatabase(databaseObject, callback)
{
  var databaseCounterRetries = 0;
      
  var databaseConnectionLoop = () =>
  {
    var databaseConnector = mysql.createConnection(
    {
      host     : databaseObject.host,
      user     : databaseObject.user,
      port     : databaseObject.port,
      password : databaseObject.password,
      connectTimeout: 2000
    });

    databaseConnector.connect((err) =>
    {
      databaseConnector.end((error) =>
      {
        databaseCounterRetries += 1;
      
        if(databaseCounterRetries < 10 && err) setTimeout(() =>{ databaseConnectionLoop(); }, 1000);
        
        else if(databaseCounterRetries === 10 && err) return callback({ status: 500, code: constants.UNABLE_TO_CONNECT_TO_DATABASE });

        else
        { 
          return callback(null); 
        }
      });
    });
  }
      
  databaseConnectionLoop();
}

/****************************************************************************************************/