'use strict'

const fs          = require('fs');
const params      = require(`${__root}/json/params`);
const errors      = require(`${__root}/json/errors`);
const constants   = require(`${__root}/functions/constants`);

/****************************************************************************************************/

module.exports.checkAccessToRootStorage = (callback) =>
{
  fs.stat(params.storage.root, (err, stats) =>
  {
    if(err) callback({ status: 404, message: errors[constants.FOLDER_NOT_FOUND] });

    else
    {
      stats.isDirectory() == false ? callback({ status: 406, message: errors[constants.IS_NOT_A_DIRECTORY] }) :

      fs.access(params.storage.root, fs.constants.R_OK | fs.constants.W_OK, (err) =>
      {
        err ? callback({ status: 406, message: errors[constants.UNAUTHORIZED_TO_READ_OR_RIGHT_IN_THE_TARGET] }) : callback();
      });
    }
  });
}

/****************************************************************************************************/