'use strict'

const fs = require('fs');

const constants = require(`${__root}/functions/constants`);

/****************************************************************************************************/

module.exports.moveFile = (currentFilePath, newFilePath, callback) =>
{
  fs.rename(currentFilePath, newFilePath, (error) =>
  {
    if(error) return callback({ status: 500, code: constants.ERROR_WHILE_MOVING_FILE, detail: error.message });

    return callback(null);
  });
}

/****************************************************************************************************/