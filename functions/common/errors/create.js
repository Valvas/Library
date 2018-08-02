'use strict'

const errors                = require(`${__root}/json/errors`);
const constants             = require(`${__root}/functions/constants`);
const databaseManager       = require(`${__root}/functions/database/MySQLv3`);

const errorsCreate = module.exports = {};

/****************************************************************************************************/

errorsCreate.createError = (errorCode, errorMessage, errorDetail, accountUUID, timestamp, applicationUUID, databaseConnection, params, attempts, callback) =>
{
  databaseManager.insertQueryWithUUID(
  {
    databaseName: params.database.root.label,
    tableName: params.database.root.tables.errors,
    args: { code: errorCode, message: errorMessage, detail: errorDetail, account_uuid: accountUUID, timestamp: timestamp, application_uuid: applicationUUID }

  }, databaseConnection, (error, result) =>
  {
    if(error != null)
    {
      if(attempts >= 3) return callback({ status: 500, code: constants.COULD_NOT_CREATE_ERROR_REPORT, detail: error });

      errorsCreate.createError(500, errors[constants.COULD_NOT_CREATE_ERROR_REPORT], error, accountUUID, Date.now(), applicationUUID, databaseConnection, params, (attempts + 1), (error) =>
      {
        return callback(error);
      });
    }

    return callback(null);
  });
}

/****************************************************************************************************/