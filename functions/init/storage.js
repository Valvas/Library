'use strict'

const fs          = require('fs');
const errors      = require(`${__root}/json/errors`);
const constants   = require(`${__root}/functions/constants`);

/****************************************************************************************************/

module.exports.checkAccessToRootStorage = (root, callback) =>
{
  fs.stat(root, (err, stats) =>
  {
    if(err) callback({ status: 404, message: errors[constants.FOLDER_NOT_FOUND] });

    else
    {
      stats.isDirectory() == false ? callback({ status: 406, message: errors[constants.IS_NOT_A_DIRECTORY] }) :

      fs.access(root, fs.constants.R_OK | fs.constants.W_OK, (err) =>
      {
        err ? callback({ status: 406, message: errors[constants.UNAUTHORIZED_TO_READ_OR_RIGHT_IN_THE_TARGET] }) : callback();
      });
    }
  });
}

/****************************************************************************************************/