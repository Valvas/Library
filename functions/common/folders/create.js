'use strict'

const fs = require('fs');

const constants = require(`${__root}/functions/constants`);

/****************************************************************************************************/

module.exports.createFolder = (folderName, parentFolderPath, callback) =>
{
  if(folderName == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'folderName' });

  if(parentFolderPath == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'parentFolderPath' });

  fs.stat(parentFolderPath, (error, stats) =>
  {
    if(error) return callback({ status: 500, code: constants.FOLDER_NOT_FOUND, detail: error.message });

    if(stats.isDirectory() == false) return callback({ status: 406, code: constants.IS_NOT_A_DIRECTORY, detail: null });

    fs.stat(`${parentFolderPath}/${folderName}`, (error, stats) =>
    {
      if(stats && stats.isDirectory()) return callback(null);

      fs.mkdir(`${parentFolderPath}/${folderName}`, (error) =>
      {
        if(error) return callback({ status: 500, code: constants.COULD_NOT_CREATE_FOLDER, detail: error.message });

        return callback(null);
      });
    });
  });
}

/****************************************************************************************************/