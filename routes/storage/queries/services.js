'use strict'

const fs                        = require('fs');
const express                   = require('express');
const formidable                = require('formidable');
const params                    = require(`${__root}/json/params`);
const errors                    = require(`${__root}/json/errors`);
const services                  = require(`${__root}/json/services`);
const commonAppStrings          = require(`${__root}/json/strings/common`);
const constants                 = require(`${__root}/functions/constants`);
const storageAppStrings         = require(`${__root}/json/strings/storage`);
const storageAppServicesGet     = require(`${__root}/functions/storage/services/get`);
const storageAppFilesUpload     = require(`${__root}/functions/storage/files/upload`);
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

  storageAppServicesRights.getRightsTowardsServices(req.session.account.id, req.app.get('mysqlConnector'), (error, rights) =>
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
      storageAppServicesGet.getService(fields.service, req.app.get('mysqlConnector'), (error, service) =>
      {
        if(error != null) res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail });

        else
        {
          storageAppServicesRights.getRightsTowardsService(service.id, req.session.account.id, req.app.get('mysqlConnector'), (error, rights) =>
          {
            if(error != null) res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail });

            else
            {
              if(rights.download_files == 0) res.status(403).send({ result: false, message: errors[constants.UNAUTHORIZED_TO_DOWNLOAD_FILES] });

              else
              {
                storageAppFilesDownload.downloadFiles(fields.files.split(','), fields.service, req.app.get('mysqlConnector'), req.session.account, (error, filePath) =>
                {
                  if(error != null) res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail });

                  else
                  {
                    res.download(filePath);
                  }
                });
              }
            }
          });
        }
      });
    }
  });
});

/****************************************************************************************************/

router.post('/get-upload-ext', (req, res) =>
{
  storageAppServicesGet.getService(req.body.service, req.app.get('mysqlConnector'), (error, service) =>
  {
    if(error != null) res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail == undefined ? null : error.detail });

    else
    {
      if(req.body.service in services == false) res.status(406).send({ result: false, message: errors[constants.SERVICE_NOT_FOUND], detail: null });

      else
      {
        res.status(200).send({ result: true, ext: services[req.body.service].ext_accepted });
      }
    }
  });
});

/****************************************************************************************************/

router.post('/check-if-file-exists-before-upload', (req, res) =>
{
  if(req.body.file == undefined || req.body.service == undefined || req.body.size == undefined) res.status(406).send({ result: false, message: errors[constants.MISSING_DATA_IN_REQUEST] });

  else
  {
    storageAppFilesUpload.prepareUpload(req.body.file.split('.')[0], req.body.file.split('.')[1], req.body.service, req.session.account, req.body.size, req.app.get('mysqlConnector'), (error, rightToReplace) =>
    {
      error != null ? 
      res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail == undefined ? null : error.detail }) :
      res.status(200).send({ result: true, rightToReplace: rightToReplace });
    });
  }
});

/****************************************************************************************************/

router.post('/upload-file', (req, res) =>
{
  var form = new formidable.IncomingForm();

  form.uploadDir = `${params.storage.root}/${params.storage.tmp}`;

  form.parse(req, (err, fields, files) =>
  {
    Object.keys(files)[0] == undefined || fields.service == undefined ? res.status(406).send({ result: false, message: errors[constants.MISSING_DATA_IN_REQUEST] }) :

    storageAppFilesUpload.uploadFile(files[Object.keys(files)[0]].name, files[Object.keys(files)[0]].path.split('\\')[files[Object.keys(files)[0]].path.split('\\').length - 1], fields.service, req.session.account.id, req.app.get('mysqlConnector'), (error) =>
    {
      error != null ?
      res.status(error.status).send({ result: false, message: error.message, detail: error.detail }) :
      res.status(200).send({ result: true });
    });
  });
});

/****************************************************************************************************/

module.exports = router;