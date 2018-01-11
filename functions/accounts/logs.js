'use strict';

var fs                  = require('fs');
var params              = require(`${__root}/json/config`);
var constants           = require(`${__root}/functions/constants`);
var filesCommon         = require(`${__root}/functions/files/common`);

/****************************************************************************************************/

module.exports.addLog = (obj, callback) =>
{
  filesCommon.createFolder(params.path_to_account_logs_storage, `${params.path_to_root_storage}/${params.path_to_logs_storage}`, (pathOrFalse, errorStatus, errorCode) =>
  {
    pathOrFalse == false ? callback(false, errorStatus, errorCode) :

    filesCommon.createFolder(`service=[${obj.service}]`, pathOrFalse, (pathOrFalse, errorStatus, errorCode) =>
    {
      pathOrFalse == false ? callback(false, errorStatus, errorCode) :

      fs.stat(`${pathOrFalse}/${obj.account}.json`, (err, stats) =>
      {
        if(err != undefined && err.code != 'ENOENT') callback(false, 500, constants.FILE_SYSTEM_ERROR);

        else if(err != undefined && err.code == 'ENOENT' || stats.isDirectory())
        {
          fs.open(`${pathOrFalse}/${obj.account}.json`, 'w', (err, fd) =>
          {
            err ? callback(false, 500, constants.FILE_SYSTEM_ERROR) :

            addLogInFile(`${obj.account}.json`, pathOrFalse, obj.content, (boolean, errorStatus, errorCode) =>
            {
              boolean ? callback(true) : callback(false, errorStatus, errorCode);
            });
          });
        }

        else
        {
          addLogInFile(`${obj.account}.json`, pathOrFalse, obj.content, (boolean, errorStatus, errorCode) =>
          {
            boolean ? callback(true) : callback(false, errorStatus, errorCode);
          });
        }
      });
    });
  });
}

/****************************************************************************************************/

function addLogInFile(file, path, obj, callback)
{
  fs.readFile(`${path}/${file}`, (err, data) =>
  {
    if(err) callback(false, 500, constants.FILE_SYSTEM_ERROR);

    else
    {
      var json;

      data.length > 0 ? json = JSON.parse(data) : json = {};

      var date = new Date(Date.now());

      var key = `${date.getFullYear()}-${date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)}-${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()} ${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}:${date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()}`;

      if(json[key] == undefined) json[key] = {};

      json[key][Object.keys(json[key]).length] = {};

      json[key][Object.keys(json[key]).length - 1] = obj;

      fs.writeFile(`${path}/${file}`, JSON.stringify(json), (err) =>
      {
        err ? callback(false, 500, constants.FILE_SYSTEM_ERROR) : callback(true);
      });
    }
  });
}

/****************************************************************************************************/