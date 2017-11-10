'use strict';

let fs                = require('fs');
let config            = require('../json/config');
let accounts          = require('./accounts/functions');

let files = module.exports = {};

/****************************************************************************************************/

files.deleteFile = function(file, service, account, mysqlConnector, callback)
{
  let objectToReturn = {}

  files.searchForFileByTag(file, mysqlConnector, function(result)
  {
    if(result == false) callback(objectToReturn);

    else
    {
      result == undefined ? objectToReturn['is_in_database'] = false : objectToReturn['is_in_database'] = true;

      if(result == undefined) callback(objectToReturn);

      else
      {
        result['service'] != service ? objectToReturn['is_part_of_service'] = false : objectToReturn['is_part_of_service'] = true;

        if(result['service'] != service) callback(objectToReturn);

        else
        {
          accounts.getUserRightsTowardsService(service, account, mysqlConnector, function(rights)
          {
            if(rights == false || rights == undefined) callback(objectToReturn);

            else
            {
              rights['remove_files'] == 0 ? objectToReturn['can_delete_files'] = false : objectToReturn['can_delete_files'] = true;

              if(rights['remove_files'] == 0) callback(objectToReturn);

              else
              {
                files.deleteFileFromHardware(service, `${result['name']}.${result['type']}`, function(result)
                {
                  result == false ? callback(objectToReturn) : objectToReturn['file_deleted_from_hardware'] = true;

                  if(result)
                  {
                    files.removeFileFromDatabase(file, mysqlConnector, function(result)
                    {
                      result == false ? callback(objectToReturn) : objectToReturn['file_deleted_from_database'] = true;

                      if(result) callback(objectToReturn);
                    });
                  }
                });
              }
            }
          });
        }
      }
    }
  });
}

/****************************************************************************************************/

files.searchForFileByTag = function(tag, mysqlConnector, callback)
{
  mysqlConnector.query(`SELECT * FROM ${config['database']['library_database']}.${config['database']['files_table']} WHERE tag = "${tag}"`, function(err, file)
  {
    if(err) callback(false);

    else
    {
      file.length == 0 ? callback(undefined) : callback(file[0]);
    }
  });
}

/****************************************************************************************************/

files.deleteFileFromHardware = function(service, file, callback)
{
  fs.stat(`${config['path_to_root_storage']}/${service}/${file}`, function(err, stat)
  {
    err ? callback(true) :

    fs.unlink(`${config['path_to_root_storage']}/${service}/${file}`, function(err)
    {
      err ? callback(false) : callback(true);
    });
  });
}

/****************************************************************************************************/

files.removeFileFromDatabase = function(tag, mysqlConnector, callback)
{
  mysqlConnector.query(`DELETE FROM ${config['database']['library_database']}.${config['database']['files_table']} WHERE tag = "${tag}"`, function(err)
  {
    err ? callback(false) : callback(true);
  });
}

/****************************************************************************************************/