'use strict';

var fs                           = require('fs');
var constants                    = require(`${__root}/functions/constants`);

/****************************************************************************************************/

module.exports.createFolder = (folder, path, callback) =>
{
  folder == undefined || path == undefined ? callback(false, 406, constants.MISSING_DATA_IN_REQUEST) :

  fs.stat(path, (err, stats) =>
  {
    if(err) callback(false, 404, constants.FOLDER_NOT_FOUND);

    else
    {
      stats.isDirectory() == false ? callback(false, 406, constants.IS_NOT_A_DIRECTORY) :

      fs.access(path, fs.constants.R_OK | fs.constants.W_OK, (err) =>
      {
        err ? callback(false, 403, constants.UNAUTHORIZED_TO_READ_OR_RIGHT_IN_THE_TARGET) :

        fs.stat(`${path}/${folder}`, (err, stats) =>
        {
          if(err && err.code != 'ENOENT') callback(false, 500, constants.FILE_SYSTEM_ERROR);

          else if(stats != undefined && stats.isDirectory() == true) callback(`${path}/${folder}`);

          else
          {
            fs.mkdir(`${path}/${folder}`, 770, (err) =>
            {
              err ? callback(false, 500, constants.FILE_SYSTEM_ERROR) : callback(`${path}/${folder}`);
            });
          }
        });
      });
    }
  });
}

/****************************************************************************************************/