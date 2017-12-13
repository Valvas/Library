'use strict';

var params            = require(`${__root}/json/config`);
var constants         = require(`${__root}/functions/constants`);
var databaseManager   = require(`${__root}/functions/database/${params.database.dbms}`);

/****************************************************************************************************/

module.exports.getFile = (fileUUID, accountUUID, databaseConnector, callback) =>
{
  databaseManager.selectQuery(
  {
    'databaseName': params.database.name,
    'tableName': params.database.tables.files,

    'args':
    {
      '0': '*'
    },

    'where':
    {
      '=':
      {
        '0':
        {
          'key': 'uuid',
          'value': fileUUID
        }
      }
    }
  }, databaseConnector, (boolean, fileOrErrorMessage) =>
  {
    if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

    else
    {
      fileOrErrorMessage.length == 0 ? callback(false, 404, constants.FILE_NOT_FOUND) :

      databaseManager.selectQuery(
      {
        'databaseName': params.database.name,
        'tableName': params.database.tables.rights,
    
        'args':
        {
          '0': '*'
        },
    
        'where':
        {
          'AND':
          {
            '=':
            {
              '0':
              {
                'key': 'account',
                'value': accountUUID
              },
              '1':
              {
                'key': 'service',
                'value': fileOrErrorMessage[0].service
              }
            }
          }
        }
      }, databaseConnector, (boolean, rightsOrErrorMessage) =>
      {
        if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

        else
        {
          rightsOrErrorMessage.length == 0 ? callback(false, 403, constants.UNAUTHORIZED_TO_ACCESS_THIS_FILE) :

          databaseManager.selectQuery(
          {
            'databaseName': params.database.name,
            'tableName': params.database.tables.accounts,
        
            'args':
            {
              '0': '*'
            },

            'where':
            {
              '=':
              {
                '0':
                {
                  'key': 'uuid',
                  'value': fileOrErrorMessage[0]['account']
                }
              }
            }
          }, databaseConnector, (boolean, accountOrErrorMessage) =>
          {
            if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

            else
            {
              accountOrErrorMessage.length == 0 ? 
              fileOrErrorMessage[0]['account'] = '????????' :
              fileOrErrorMessage[0]['account'] = `${accountOrErrorMessage[0]['firstname'].charAt(0).toUpperCase()}${accountOrErrorMessage[0]['firstname'].slice(1)} ${accountOrErrorMessage[0]['lastname'].toUpperCase()}`;

              callback(fileOrErrorMessage[0]);
            }
          });
        }
      });
    }
  });
}

/****************************************************************************************************/