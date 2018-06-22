'use strict'

const UUIDModule        = require('uuid');
const shareAppParams    = require(__root + '/json/share/params');

/****************************************************************************************************/

module.exports.initShareApplication = (databaseParams, databaseConnection) =>
{
  addExtensionsInDatabase(databaseParams, databaseConnection);
}

/****************************************************************************************************/

function addExtensionsInDatabase(databaseParams, databaseConnection)
{
  const extensions = shareAppParams.extensions;

  var extensionsIterator = 0;

  var browseExtensionsLoop = () =>
  {
    databaseConnection.query(`SELECT uuid FROM ${databaseParams.label}.${databaseParams.tables.extensions} WHERE value = "${extensions[extensionsIterator]}"`, (error, result) =>
    {
      if(error)
      {
        console.log(`[ShareAppInit] - ERROR - ${error.message} !`);

        if(extensions[extensionsIterator += 1] != undefined) browseExtensionsLoop();
      }

      else if(result.length > 0)
      {
        if(extensions[extensionsIterator += 1] != undefined) browseExtensionsLoop();
      }

      else
      {
        const uuid = UUIDModule.v4();

        databaseConnection.query(`INSERT INTO ${databaseParams.label}.${databaseParams.tables.extensions} (uuid, value) VALUES ("${uuid}", "${extensions[extensionsIterator]}")`, (error, result) =>
        {
          if(error)
          {
            console.log(`[ShareAppInit] - ERROR - ${error.message} !`);

            if(extensions[extensionsIterator += 1] != undefined) browseExtensionsLoop();
          }

          else
          {
            if(extensions[extensionsIterator += 1] != undefined) browseExtensionsLoop();
          }
        });
      }
    });
  }

  if(extensions[extensionsIterator] != undefined) browseExtensionsLoop();
}

/****************************************************************************************************/