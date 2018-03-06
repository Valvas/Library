'use strict'

const express                   = require('express');
const formidable                = require('formidable');
const errors                    = require(`${__root}/json/errors`);
const commonAppStrings          = require(`${__root}/json/strings/common`);
const constants                 = require(`${__root}/functions/constants`);
const storageAppStrings         = require(`${__root}/json/strings/storage`);
const storageAppFilesDownload   = require(`${__root}/functions/storage/files/download`);
const storageAppServicesRights  = require(`${__root}/functions/storage/services/rights`);

var router = express.Router();

/****************************************************************************************************/

router.put('/get-account-rights', (req, res) =>
{
  req.body.service == undefined ?

  res.status(406).send(
  {
    message: errors[constants.MISSING_DATA_IN_REQUEST],
    detail: null
  }) :

  storageAppServicesRights.getRightsTowardsServices(req.session.account.email, req.app.get('mysqlConnector'), (error, rights) =>
  {
    if(error != null)
    {
      res.status(error.status).send(
      {
        message: errors[error.code],
        detail: error.detail == undefined ? null : error.detail
      });
    }

    else
    {
      res.status(200).send(
      {
        rights: rights,
        strings: { common: commonAppStrings, storage: storageAppStrings }
      });
    }
  });
});

/****************************************************************************************************/

router.post('/download-files', (req, res) =>
{
  var form = new formidable.IncomingForm();

  form.parse(req, (err, fields) =>
  {
    if(err) res.status(500).send({ result: false, message: errors[constants.COULD_NOT_PARSE_INCOMING_FORM], detail: err.message });

    else
    {
      storageAppFilesDownload.downloadFiles(fields.files, fields.service, req.app.get('mysqlConnector'), (error, filePath) =>
      {
        if(error) res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail });

        else
        {
          res.download(filePath);
        }
      });
    }
  });
});

/****************************************************************************************************/

module.exports = router;