'use strict';

var express           = require('express');
var config            = require(`${__root}/json/config`);
var errors            = require(`${__root}/json/errors`);
var success           = require(`${__root}/json/success`);
var filesGet          = require(`${__root}/functions/files/get`);
var constants         = require(`${__root}/functions/constants`);
var accountsRights    = require(`${__root}/functions/accounts/rights`);

var router = express.Router();

/****************************************************************************************************/

router.get('/:file', (req, res) =>
{
  filesGet.getFile(req.params.file, req.session.uuid, req.app.get('mysqlConnector'), (fileOrFalse, errorStatus, errorCode) =>
  {
    fileOrFalse == false ?

    res.render('block', { message: `${errors[errorCode].charAt(0).toUpperCase()}${errors[errorCode].slice(1)}` }) :

    accountsRights.getUserRightsTowardsService(fileOrFalse.service, req.session.uuid, req.app.get('mysqlConnector'), (rightsOrFalse, errorStatus, errorCode) =>
    {
      rightsOrFalse == false ?
      
      res.render('block', { message: `${errors[errorCode].charAt(0).toUpperCase()}${errors[errorCode].slice(1)}` }) :

      res.render('file', { navigationLocation: 'services', asideLocation: fileOrFalse.service, file: fileOrFalse, links: require(`${__root}/json/services`), ext: config['file_ext'], rights: rightsOrFalse });
    });
  });
});

/****************************************************************************************************/

module.exports = router;