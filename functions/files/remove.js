'use strict'

const fs                      = require('fs');
const params                  = require(`${__root}/json/params`);
const constants               = require(`${__root}/functions/constants`);

/****************************************************************************************************/

module.exports.removeFile = (fileName, filePath, callback) =>
{
  fileName == undefined ||
  filePath == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  fs.stat(`${filePath}/${fileName}`, (error, stats) =>
  {
    if(error && error.code != 'ENOENT') callback({ status: 500, code: constants.FILE_SYSTEM_ERROR, detail: error.message });

    else if(error && error.code == 'ENOENT') callback(null);

    else
    {
      if(stats.isDirectory() == true) callback({ status: 406, code: constants.IS_A_DIRECTORY });

      else
      {
        fs.unlink(`${filePath}/${fileName}`, (error) =>
        {
          error ? callback({ status: 500, code: constants.FILE_SYSTEM_ERROR, detail: error.message }) : callback(null);
        });
      }
    }
  });
}

/****************************************************************************************************/

module.exports.moveFileToBin = (fileName, fileExt, filePath, callback) =>
{
  fileName  == undefined ||
  fileExt   == undefined ||
  filePath  == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  fs.stat(`${filePath}/${fileName}.${fileExt}`, (error, stats) =>
  {
    if(error) callback({ status: 500, code: constants.FILE_SYSTEM_ERROR, detail: error.message });

    else
    {
      if(stats.isDirectory() == true) callback({ status: 406, code: constants.IS_A_DIRECTORY });

      else
      {
        fs.rename(`${filePath}/${fileName}.${fileExt}`, `${params.storage.root}/${params.storage.bin}/${fileName}[${fileExt}]-${Date.now()}`, (error) =>
        {
          error ? callback({ status: 500, code: constants.FILE_SYSTEM_ERROR, detail: error.message }) : callback(null);
        });
      }
    }
  });
}

/****************************************************************************************************/