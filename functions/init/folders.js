'use strict'

const fs            = require('fs');
const constants     = require(`${__root}/functions/constants`);

/****************************************************************************************************/

module.exports.createAppFolders = (params, callback) =>
{
  createTmpFolder(params, (error) =>
  {
    return callback(error);
  });
}

/****************************************************************************************************/

function createTmpFolder(params, callback)
{
  fs.mkdir(`${params.storage.root}/${params.storage.tmp}`, (error) =>
  {
    if(error && error.code !== 'EEXIST') return callback({ status: 500, code: constants.COULD_NOT_CREATE_FOLDER, detail: error.message });

    createBinFolder(params, callback);
  });
}

/****************************************************************************************************/

function createBinFolder(params, callback)
{
  fs.mkdir(`${params.storage.root}/${params.storage.bin}`, (error) =>
  {
    if(error && error.code !== 'EEXIST') return callback({ status: 500, code: constants.COULD_NOT_CREATE_FOLDER, detail: error.message });

    createServicesFolder(params, callback);
  });
}

/****************************************************************************************************/

function createServicesFolder(params, callback)
{
  fs.mkdir(`${params.storage.root}/${params.storage.services}`, (error) =>
  {
    if(error && error.code !== 'EEXIST') return callback({ status: 500, code: constants.COULD_NOT_CREATE_FOLDER, detail: error.message });

    createServicesLogsFolder(params, callback);
  });
}

/****************************************************************************************************/

function createServicesLogsFolder(params, callback)
{
  fs.mkdir(`${params.storage.root}/${params.storage.fileLogs}`, (error) =>
  {
    if(error && error.code !== 'EEXIST') return callback({ status: 500, code: constants.COULD_NOT_CREATE_FOLDER, detail: error.message });

    createAccountsFolder(params, callback);
  });
}

/****************************************************************************************************/

function createAccountsFolder(params, callback)
{
  fs.mkdir(`${params.storage.root}/${params.storage.accounts}`, (error) =>
  {
    if(error && error.code !== 'EEXIST') return callback({ status: 500, code: constants.COULD_NOT_CREATE_FOLDER, detail: error.message });

    return callback(null);
  });
}

/****************************************************************************************************/
