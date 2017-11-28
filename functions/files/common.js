'use strict';

let fs                           = require('fs');
let constants                    = require('../constants');

/****************************************************************************************************/

/**
 * Create a new folder at path given
 * @arg {String} folder - the name of the folder to create
 * @arg {String} path - the path where the folder must be created
 * @return {Boolean}
 */
module.exports.createFolder = function(folder, path, callback)
{
  folder == undefined || path == undefined ? callback(false, constants.MISSING_DATA_IN_REQUEST) :

  fs.stat(path, (err, stats) =>
  {
    if(err) callback(false, constants.FOLDER_NOT_FOUND);

    else
    {
      stats.isDirectory() == false ? callback(false, constants.IS_NOT_A_DIRECTORY) :

      fs.access(path, fs.constants.R_OK | fs.constants.W_OK, (err) =>
      {
        err ? callback(false, constants.UNAUTHORIZED_TO_READ_OR_RIGHT_IN_THE_TARGET) :

        fs.stat(`${path}/${folder}`, (err, stats) =>
        {
          if(err && err.code != 'ENOENT') callback(false, constants.FILE_SYSTEM_ERROR);

          else if(stats != undefined && stats.isDirectory() == true) callback(true, `${path}/${folder}`);

          else
          {
            fs.mkdir(`${path}/${folder}`, 770, (err) =>
            {
              err ? callback(false, constants.FILE_SYSTEM_ERROR) : callback(true, `${path}/${folder}`);
            });
          }
        });
      });
    }
  });
}

/****************************************************************************************************/