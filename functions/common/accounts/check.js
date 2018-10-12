'use strict'

const constants           = require(`${__root}/functions/constants`);
const encryption          = require(`${__root}/functions/encryption`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);

/****************************************************************************************************/

module.exports.checkIfAccountExistsFromCredentials = (emailAddress, uncryptedPassword, databaseConnection, params, callback) =>
{
  if(params == undefined)             return callback({ status: 406, code: constants.MISSING_DATA_FROM_REQUEST, detail: 'params' });
  if(emailAddress == undefined)       return callback({ status: 406, code: constants.MISSING_DATA_FROM_REQUEST, detail: 'emailAddress' });
  if(uncryptedPassword == undefined)  return callback({ status: 406, code: constants.MISSING_DATA_FROM_REQUEST, detail: 'uncryptedPassword' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_FROM_REQUEST, detail: 'databaseConnection' });

  encryption.encryptPassword(uncryptedPassword, (error, encryptedPassword) =>
  {
    if(error != null) return callback(error);

    databaseManager.selectQuery(
    {
      databaseName: params.database.root.label,
      tableName: params.database.root.tables.accounts,
      args: [ 'uuid' ],
      where: { condition: 'AND', 0: { operator: '=', key: 'email', value: emailAddress }, 1: { operator: '=', key: 'password', value: encryptedPassword } }

    }, databaseConnection, (error, result) =>
    {
      if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

      if(result.length === 0) return callback({ status: 404, code: constants.ACCOUNT_NOT_FOUND, detail: null });

      return callback(null, result[0]);
    });
  });
}

/****************************************************************************************************/