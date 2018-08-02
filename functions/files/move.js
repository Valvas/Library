'use strict'

const fs                      = require('fs');
const constants               = require(`${__root}/functions/constants`);

/****************************************************************************************************/

module.exports.moveFile = (currentPath, newPath, newName, callback) =>
{
  currentPath   == undefined ||
  newPath       == undefined ||
  newName       == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  fs.stat(currentPath, (error, stats) =>
  {
    if(error) return callback({ status: 500, code: constants.FILE_SYSTEM_ERROR, detail: error.message });

    if(stats.isDirectory() == true) return callback({ status: 406, code: constants.IS_A_DIRECTORY, detail: null });

    fs.rename(currentPath, `${newPath}/${newName}`, (error) =>
    {
      if(error) return callback({ status: 500, code: constants.FILE_SYSTEM_ERROR, detail: error.detail });

      return callback(null);
    });
  });
}

/****************************************************************************************************/