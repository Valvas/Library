'use strict'

const fs = require('fs');
const constants = require(`${__root}/functions/constants`);

/****************************************************************************************************/
/* Create Record Folder If It Does Not Exist */
/****************************************************************************************************/

function createRecordFolder(recordUuid, globalParameters, callback)
{
  fs.mkdir(`${globalParameters.storage.root}/${globalParameters.storage.stoppage}/${recordUuid}`, { recursive: true }, (error) =>
  {
    if(error !== null && error.code !== 'EEXIST')
    {
      return callback({ status: 500, code: constants.COULD_NOT_CREATE_FOLDER, detail: error.message });
    }

    return callback(null);
  });
}

/****************************************************************************************************/

module.exports =
{
  createRecordFolder: createRecordFolder
}
