'use strict'

const fs                = require('fs');
const errors            = require(`${__root}/json/errors`);
const params            = require(`${__root}/json/params`);
const constants         = require(`${__root}/functions/constants`);

/****************************************************************************************************/

module.exports.checkConfigDataFormat = (object, callback) =>
{
  object                      == undefined ||

  object.other                == undefined ||
  object.storage              == undefined ||
  object.database             == undefined ||
  object.transporter          == undefined ||

  object.database.port        == undefined ||
  object.database.user        == undefined ||
  object.database.name        == undefined ||
  object.database.host        == undefined ||
  object.database.manager     == undefined ||
  object.database.password    == undefined ||

  object.storage.root         == undefined ||
  object.storage.size         == undefined ||

  object.transporter.port     == undefined ||
  object.transporter.user     == undefined ||
  object.transporter.address  == undefined ||
  object.transporter.password == undefined ||

  object.other.port           == undefined ||
  object.other.salt           == undefined ||
  object.other.timeout        == undefined ||
  object.other.environment    == undefined ?

  callback({ status: 406, message: `${errors[constants.MISSING_DATA_IN_REQUEST].charAt(0).toUpperCase()}${errors[constants.MISSING_DATA_IN_REQUEST].slice(1)}` }) :

  checkStorageFileMaxSize(object.storage.size, (newSize) =>
  {
    object.storage.size = newSize;

    checkAppTimeout(object.other.timeout, (newTimeout) =>
    {
      object.other.timeout = newTimeout;

      checkAppPort(object.other.port, (newPort) =>
      {
        object.other.port = newPort;

        checkEnvironment(object.other.environment, (newEnvironment) =>
        {
          object.other.environment = newEnvironment;

          callback(null);
        });
      });
    });
  });
}

/****************************************************************************************************/

function checkStorageFileMaxSize(fileSize, callback)
{
  if(parseInt(fileSize) * 1024 < params.init.minFileSize) callback(params.init.minFileSize);
  else if(parseInt(fileSize) * 1024 > params.init.maxFileSize) callback(params.init.maxFileSize);
  else{ callback(parseInt(fileSize) * 1024); }
}

/****************************************************************************************************/

function checkAppTimeout(timeout, callback)
{
  if(parseInt(timeout) * 60000 < params.init.minTimeout) callback(params.init.minTimeout);
  else if(parseInt(timeout) * 60000 > params.init.maxTimeout) callback(params.init.maxTimeout);
  else{ callback(parseInt(timeout) * 60000); }
}

/****************************************************************************************************/

function checkAppPort(port, callback)
{
  if(parseInt(port) < 0) callback(params.init.defaultPort);
  else if(parseInt(port) > 65535) callback(params.init.defaultPort);
  else{ callback(parseInt(port)); }
}

/****************************************************************************************************/

function checkEnvironment(environment, callback)
{
  environment == 'dev' || environment == 'test' || environment == 'prod' ? callback(environment) : callback(params.init.defaultEnvironment);
}

/****************************************************************************************************/