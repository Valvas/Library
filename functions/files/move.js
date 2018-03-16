'use strict'

const fs                      = require('fs');
const constants               = require(`${__root}/functions/constants`);

/****************************************************************************************************/

module.exports.moveFile = (oldPath, oldName, newPath, newName, callback) =>
{
  oldPath == undefined ||
  oldName == undefined ||
  newPath == undefined ||
  newName == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  fs.stat(`${oldPath}/${oldName}`, (error, stats) =>
  {
    if(error) callback({ status: 500, code: constants.FILE_SYSTEM_ERROR, detail: error.message });

    else if(stats.isDirectory() == true) callback({ status: 406, code: constants.IS_A_DIRECTORY });

    else
    {
      fs.rename(`${oldPath}/${oldName}`, `${newPath}/${newName}`, (error) =>
      {
        if(error) callback({ status: 500, code: constants.FILE_SYSTEM_ERROR, detail: error.detail });

        else
        {
          callback(null);
        }
      });
    }
  });
}

/****************************************************************************************************/