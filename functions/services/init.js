'use strict';

const fs                  = require('fs');
const config              = require(`${__root}/json/config`);
const services            = require(`${__root}/json/services`);
const constants           = require(`${__root}/functions/constants`);
const encrypter           = require(`${__root}/functions/encryption`);
const databaseManager     = require(`${__root}/functions/database/${config.database.dbms}`);

/****************************************************************************************************/

module.exports.createServices = (databaseConnector, callback) =>
{
  fs.readFile(`${__root}/json/services.json`, (err, data) =>
  {
    if(err) callback({ status: 500, code: constants.COULD_NOT_READ_SERVICES_FILE, detail: err.message });

    else
    {
      var json = JSON.parse(data);

      var x = 0;

      var loop = () =>
      {
        databaseManager.selectQuery(
        {
          'databaseName': config.database.name,
          'tableName': config.database.tables.services,
          'args': { '0': 'id' },
          'where': { '=': { '0': { 'key': 'name', 'value': Object.keys(json)[x] } } }

        }, databaseConnector, (boolean, serviceOrErrorMessage) =>
        {
          if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: serviceOrErrorMessage });

          else
          {
            if(serviceOrErrorMessage.length > 0)
            {
              console.log(`[SERVICES] - "${json[Object.keys(json)[x]].name}" already exists !`);
              Object.keys(json)[x += 1] == undefined ? callback(null) : loop();
            }

            else
            {
              databaseManager.insertQuery(
              {
                'databaseName': config.database.name,
                'tableName': config.database.tables.services,
                'args': { 'name': Object.keys(json)[x], 'label': json[Object.keys(json)[x]].name }

              }, databaseConnector, (boolean, insertedIDOrErrorMessage) =>
              {
                if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: serviceOrErrorMessage });

                else
                {
                  console.log(`[SERVICES] - "${json[Object.keys(json)[x]].name}" successfully created !`);
                  Object.keys(json)[x += 1] == undefined ? callback(null) : loop();
                }
              });
            }
          }
        });
      }

      if(Object.keys(json).length == 0)
      {
        console.log('[SERVICES] - no services to create !');
        callback(null);
      }

      else
      {
        loop();
      }
    }
  });
}

/****************************************************************************************************/