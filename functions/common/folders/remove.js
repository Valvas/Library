'use strict'

const fs = require('fs');

const constants = require(`${__root}/functions/constants`);

/****************************************************************************************************/

module.exports.removeFolder = (folderPath, callback) =>
{
  if(folderPath == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: null });

  fs.stat(folderPath, (error, stats) =>
  {
    if(error) return callback({ status: 500, code: constants.FOLDER_NOT_FOUND, detail: error.message });

    if(stats.isDirectory() == false) return callback({ status: 406, code: constants.IS_NOT_A_DIRECTORY, detail: null });

    fs.rmdir(folderPath, (error) =>
    {
      if(error) return callback({ status: 500, code: constants.COULD_NOT_REMOVE_FOLDER, detail: error.message });

      return callback(null);
    });
  });
}

/****************************************************************************************************/