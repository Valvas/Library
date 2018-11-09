'use strict'

const fs          = require('fs');
const errors      = require(`${__root}/json/errors`);
const constants   = require(`${__root}/functions/constants`);

/****************************************************************************************************/

module.exports.checkAccessToRootStorage = (params, callback) =>
{
  fs.stat(params.storage.root, (error, stats) =>
  {
    if(error) return callback({ status: 404, message: errors[constants.FOLDER_NOT_FOUND] });

    if(stats.isDirectory() == false) return callback({ status: 406, message: errors[constants.IS_NOT_A_DIRECTORY] });

    fs.access(params.storage.root, fs.constants.R_OK | fs.constants.W_OK, (error) =>
    {
      error ? callback({ status: 406, message: errors[constants.UNAUTHORIZED_TO_READ_OR_RIGHT_IN_THE_TARGET] }) : callback(null);
    });
  });
}

/****************************************************************************************************/