'use strict';

var express           = require('express');
var errors            = require(`${__root}/json/errors`);
var success           = require(`${__root}/json/success`);
var filesGet          = require(`${__root}/functions/files/get`);
var constants         = require(`${__root}/functions/constants`);

var router = express.Router();

/****************************************************************************************************/

router.get('/:file', (req, res) =>
{
  filesGet.getFile(req.params.file, req.session.uuid, req.app.get('mysqlConnector'), (fileOrFalse, errorStatus, errorCode) =>
  {
    fileOrFalse == false ?
    res.render('block', { message: `Erreur [${errorStatus}] - ${errors[errorCode]} !` }) :
    res.render('file', { file: fileOrFalse, links: require('../json/services') });
  });
});

/****************************************************************************************************/

module.exports = router;