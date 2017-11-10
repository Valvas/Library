'use strict';

let encryption          = require('./encryption');
let config              = require('../json/config');

let services = module.exports = {};

/****************************************************************************************************/

services.getFilesFromOneService = function(service, mysqlConnector, callback)
{
  mysqlConnector == undefined ? callback(false) :

  mysqlConnector.query(`SELECT tag, name, type, account FROM ${config['database']['library_database']}.${config['database']['files_table']} WHERE service = "${service}"`, function(err, files)
  {
    if(err) callback(false);

    else
    {
      files.length == 0 ? callback({}) : 
      
      getFilesOwners(files, mysqlConnector, function(object)
      {
        object == false ? callback(false) : callback(object);
      });
    }
  });
}

/****************************************************************************************************/

function getFilesOwners(files, mysqlConnector, callback)
{
  let x = 0;

  let loop = function(file)
  {
    mysqlConnector.query(`SELECT firstname, lastname FROM ${config['database']['library_database']}.${config['database']['auth_table']} WHERE email = "${file['account']}"`, function(err, account)
    {
      if(err) callback(false);

      else
      {
        account.length == 0 ? files[Object.keys(files)[x]]['account'] = '??????' : files[Object.keys(files)[x]]['account'] = `${account[0]['firstname']} ${account[0]['lastname'].toUpperCase()}`;

        x++;

        Object.keys(files)[x] != undefined ? loop(files[Object.keys(files)[x]]) : callback(files);
      }
    });
  }

  loop(files[Object.keys(files)[x]]);
}

/****************************************************************************************************/