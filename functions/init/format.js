'use strict'

const errors            = require(`${__root}/json/errors`);
const constants         = require(`${__root}/functions/constants`);

/****************************************************************************************************/

module.exports.checkConfigDataFormat = (object, params, callback) =>
{
  object                      == undefined ||

  object.other                == undefined ||
  object.storage              == undefined ||
  object.database             == undefined ||
  object.transporter          == undefined ||

  object.database.port        == undefined ||
  object.database.user        == undefined ||
  object.database.host        == undefined ||
  object.database.manager     == undefined ||
  object.database.password    == undefined ||

  object.storage.root         == undefined ||

  object.transporter.port     == undefined ||
  object.transporter.user     == undefined ||
  object.transporter.address  == undefined ||
  object.transporter.password == undefined ||

  object.other.port           == undefined ||
  object.other.salt           == undefined ||
  object.other.timeout        == undefined ?

  callback({ status: 406, message: errors[constants.MISSING_DATA_IN_REQUEST] }) :

  checkAppTimeout(object.other.timeout, params, (newTimeout) =>
  {
    object.other.timeout = newTimeout;

    checkAppPort(object.other.port, params, (newPort) =>
    {
      object.other.port = newPort;

      params.database.host        = object.database.host;
      params.database.port        = object.database.port;
      params.database.user        = object.database.user;
      params.database.dbms        = object.database.manager;
      params.database.password    = object.database.password;

      params.storage.root         = object.storage.root;

      params.transporter.user     = object.transporter.user;
      params.transporter.port     = object.transporter.port;
      params.transporter.secure   = object.transporter.secure == 'true' ? true : false;
      params.transporter.address  = object.transporter.address;
      params.transporter.password = object.transporter.password;

      params.timeout              = object.other.timeout;
      params.port                 = object.other.port;
      params.init.keepSalt        = object.other.salt == 'true' ? true : false;

      return callback(null);
    });
  });
}

/****************************************************************************************************/

function checkAppTimeout(timeout, params, callback)
{
  if(parseInt(timeout) * 60000 < params.init.minTimeout) return callback(params.init.minTimeout);
  if(parseInt(timeout) * 60000 > params.init.maxTimeout) return callback(params.init.maxTimeout);

  return callback(parseInt(timeout) * 60000);
}

/****************************************************************************************************/

function checkAppPort(port, params, callback)
{
  if(parseInt(port) < 0) callback(params.init.defaultPort);
  else if(parseInt(port) > 65535) callback(params.init.defaultPort);
  else{ callback(parseInt(port)); }
}

/****************************************************************************************************/