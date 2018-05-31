'use strict'

const fs            = require('fs');
const config        = require(`${__root}/json/config`);
const constants     = require(`${__root}/functions/constants`);

/****************************************************************************************************/

module.exports.createAppFolders = (params, callback) =>
{
  createTmpFolder(params, (error) =>
  {
    error != null ? callback(error) :

    createBinFolder(params, (error) =>
    {
      error != null ? callback(error) :

      createLogsFolder(params, (error) =>
      {
        callback(error);
      });
    });
  });
}

/****************************************************************************************************/

function createTmpFolder(params, callback)
{
  fs.mkdir(`${params.storage.root}/${config.path_to_temp_storage}`, (error) =>
  {
    error && error.code != 'EEXIST' ? callback({ status: 500, code: constants.COULD_NOT_CREATE_FOLDER, detail: error.message }) : callback(null);
  });
}

/****************************************************************************************************/

function createBinFolder(params, callback)
{
  fs.mkdir(`${params.storage.root}/${config.path_to_bin_storage}`, (error) =>
  {
    error && error.code != 'EEXIST' ? callback({ status: 500, code: constants.COULD_NOT_CREATE_FOLDER, detail: error.message  }) : callback(null);
  });
}

/****************************************************************************************************/

function createLogsFolder(params, callback)
{
  fs.mkdir(`${params.storage.root}/${config.path_to_logs_storage}`, (error) =>
  {
    error && error.code != 'EEXIST' ? callback({ status: 500, code: constants.COULD_NOT_CREATE_FOLDER, detail: error.message  }) : callback(null);
  });
}

/****************************************************************************************************/