'use strict'

const fs                        = require('fs');
const express                   = require('express');
const formidable                = require('formidable');
const params                    = require(`${__root}/json/params`);
const errors                    = require(`${__root}/json/errors`);
const success                   = require(`${__root}/json/success`);
const services                  = require(`${__root}/json/services`);
const commonAppStrings          = require(`${__root}/json/strings/common`);
const constants                 = require(`${__root}/functions/constants`);
const storageAppStrings         = require(`${__root}/json/strings/storage`);
const accountsGet               = require(`${__root}/functions/accounts/get`);
const storageAppAdminGet        = require(`${__root}/functions/storage/admin/get`);
const storageAppServicesGet     = require(`${__root}/functions/storage/services/get`);
const storageAppFilesUpload     = require(`${__root}/functions/storage/files/upload`);
const storageAppFilesRemove     = require(`${__root}/functions/storage/files/remove`);
const storageAppFilesDownload   = require(`${__root}/functions/storage/files/download`);
const storageAppAdminServices   = require(`${__root}/functions/storage/admin/services`);
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

router.post('/download-file', (req, res) =>
{
  var form = new formidable.IncomingForm();

  form.parse(req, (err, fields) =>
  {
    if(err) res.status(500).send({ result: false, message: errors[constants.COULD_NOT_PARSE_INCOMING_FORM], detail: err.message });

    else
    {
      storageAppServicesGet.getServiceUsingName(fields.service, req.app.get('mysqlConnector'), (error, service) =>
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
                storageAppFilesDownload.downloadFile(fields.files, fields.service, req.app.get('mysqlConnector'), req.session.account, (error, filePath) =>
                {
                  if(error != null) res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail });

                  else
                  {
                    res.download(filePath, fields.files);
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

router.post('/get-file-upload-parameters', (req, res) =>
{
  var form = new formidable.IncomingForm();

  form.parse(req, (err, fields) =>
  {
    if(err) res.status(500).send({ result: false, message: errors[constants.COULD_NOT_PARSE_INCOMING_FORM], detail: err.message });

    else
    {
      storageAppServicesGet.getServiceUsingName(fields.service, req.app.get('mysqlConnector'), (error, service) =>
      {
        if(error != null) res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail == undefined ? null : error.detail });

        else
        {
          storageAppServicesGet.getFileMaxSize(service.id, req.app.get('mysqlConnector'), (error, size) =>
          {
            if(error != null) res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail == undefined ? null : error.detail });

            else
            {
              if(fields.service in req.app.get('servicesExtensionsAuthorized') == false) res.status(406).send({ result: false, message: errors[constants.SERVICE_NOT_FOUND], detail: 'Authorized file extensions could not be found for the current service, please report this issue to an administrator as soon as possible' });

              else
              {
                res.status(200).send({ result: true, strings: { common: commonAppStrings, storage: storageAppStrings }, size: size, ext: req.app.get('servicesExtensionsAuthorized')[fields.service].ext_accepted });
              }
            }
          });
        }
      });
    }
  });
});

/****************************************************************************************************/

router.post('/prepare-upload', (req, res) =>
{
  var form = new formidable.IncomingForm();

  form.parse(req, (err, fields, files) =>
  {
    if(err) res.status(500).send({ result: false, message: errors[constants.COULD_NOT_PARSE_INCOMING_FORM], detail: err.message });

    else
    {
      fields.service  == undefined ||
      fields.file     == undefined ?

      res.status(406).send({ result: false, message: errors[constants.MISSING_DATA_IN_REQUEST], detail: null }) :

      storageAppFilesUpload.prepareUpload(JSON.parse(fields.file).name.split('.')[0], JSON.parse(fields.file).name.split('.')[1], JSON.parse(fields.file).size, fields.service, req.session.account.id, Object.values(req.app.get('servicesExtensionsAuthorized')[fields.service].ext_accepted), req.app.get('mysqlConnector'), req.app.get('params'), (error, rightToRemoveCurrentFile) =>
      {
        if(error != null) res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail });

        else
        {
          res.status(200).send({ result: true, strings: { common: commonAppStrings, storage: storageAppStrings }, remove: rightToRemoveCurrentFile == undefined ? null : rightToRemoveCurrentFile });
        }
      });
    }
  });
});

/****************************************************************************************************/

router.post('/upload-file', (req, res) =>
{
  var form = new formidable.IncomingForm();

  form.uploadDir = `${params.storage.root}/${params.storage.tmp}`;

  form.parse(req, (err, fields, files) =>
  {console.log(err);
    Object.keys(files)[0] == undefined || fields.service == undefined ? res.status(406).send({ result: false, message: errors[constants.MISSING_DATA_IN_REQUEST] }) :

    storageAppFilesUpload.uploadFile(files[Object.keys(files)[0]].name, files[Object.keys(files)[0]].path.split('\\')[files[Object.keys(files)[0]].path.split('\\').length - 1], fields.service, req.session.account.id, req.app.get('mysqlConnector'), req.app.get('params'), (error, fileID) =>
    {
      error != null ?
      res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail == undefined ? null : error.detail }) :
      res.status(200).send({ result: true, message: success[constants.FILE_SENT_SUCCESSFULLY], fileID: fileID });
    });
  });
});

/****************************************************************************************************/

router.post('/create-service', (req, res) =>
{
  var form = new formidable.IncomingForm();

  form.parse(req, (err, fields) =>
  {
    if(err) res.status(500).send({ result: false, message: errors[constants.COULD_NOT_PARSE_INCOMING_FORM], detail: err.message });

    else
    {
      var service = JSON.parse(fields.service);

      storageAppAdminServices.createService(service.identifier, service.name, service.size, service.extensions, req.session.account.id, req.app.get('servicesExtensionsAuthorized'), req.app.get('mysqlConnector'), req.app.get('params'), (error, serviceID) =>
      {
        if(error != null)
        {
          res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail == undefined ? null : error.detail });
        }

        else
        {
          if(Object.keys(service.members).length == 0)
          {
            res.status(201).send({ result: true, message: success[constants.SERVICE_SUCCESSFULLY_CREATED] });
          }

          else
          {
            storageAppAdminServices.addMembersToService(serviceID, service.members, req.session.account.id, req.app.get('mysqlConnector'), req.app.get('params'), (error) =>
            {
              if(error != null)
              {
                res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail == undefined ? null : error.detail });
              }

              else
              {
                res.status(201).send({ result: true, message: success[constants.SERVICE_SUCCESSFULLY_CREATED] });
              }
            });
          }
        }
      });
    }
  });
});

/****************************************************************************************************/

router.post('/remove-service', (req, res) =>
{
  var form = new formidable.IncomingForm();

  form.parse(req, (err, fields) =>
  {
    if(err) res.status(500).send({ result: false, message: errors[constants.COULD_NOT_PARSE_INCOMING_FORM], detail: err.message });

    else
    {
      storageAppAdminServices.removeService(fields.service, req.session.account.id, req.app.get('mysqlConnector'), req.app.get('params'), (error) =>
      {
        if(error == null) res.status(200).send({ message: success[constants.SERVICE_SUCCESSFULLY_REMOVED], detail: null });

        else
        {
          res.status(error.status).send({ message: errors[error.code], detail: error.detail });
        }
      });
    }
  });
});

/****************************************************************************************************/

router.post('/remove-files', (req, res) =>
{
  var form = new formidable.IncomingForm();

  form.parse(req, (err, fields) =>
  {
    if(err) res.status(500).send({ result: false, message: errors[constants.COULD_NOT_PARSE_INCOMING_FORM], detail: err.message });

    else
    {
      storageAppServicesGet.getServiceUsingName(fields.service, req.app.get('mysqlConnector'), (error, service) =>
      {
        error != null ? res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail == undefined ? null : error.detail }) :

        storageAppServicesRights.getRightsTowardsService(service.id, req.session.account.id, req.app.get('mysqlConnector'), (error, rights) =>
        {
          if(error != null) res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail == undefined ? null : error.detail });

          else
          {
            if(rights.remove_files == 0) res.status(403).send({ message: errors[constants.UNAUTHORIZED_TO_DELETE_FILES], detail: null });

            else
            {
              storageAppFilesRemove.removeFiles(fields.files.split(','), service, req.session.account.id, req.app.get('mysqlConnector'), (error) =>
              {
                if(error != null) res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail == undefined ? null : error.detail });

                else
                {
                  res.status(200).send({ result: true });
                }
              });
            }
          }
        });
      });
    }
  });
});

/****************************************************************************************************/

router.post('/modify-service-label', (req, res) =>
{
  if(req.body.serviceID == undefined || req.body.serviceLabel == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: null });

  else
  {
    storageAppServicesGet.getServiceUsingName(req.body.serviceID, req.app.get('mysqlConnector'), (error, service) =>
    {
      if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      else
      {
        if(service.label == req.body.serviceLabel) res.status(200).send({ message: success[constants.SERVICE_LABEL_UNCHANGED], detail: null });

        else
        {
          storageAppAdminGet.getAccountAdminRights(req.session.account.id, req.app.get('mysqlConnector'), (error, rights) =>
          {
            if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

            else if(rights.modify_services == 0) res.status(403).send({ message: errors[constants.UNAUTHORIZED_TO_MODIFY_SERVICES], detail: null });

            else
            {
              storageAppAdminServices.updateServiceLabel(service.id, req.body.serviceLabel, req.app.get('mysqlConnector'), req.app.get('params'), (error) =>
              {
                if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

                else
                {
                  res.status(200).send({ message: success[constants.SERVICE_LABEL_SUCCESSFULLY_UPDATED], detail: null });
                }
              });
            }
          });
        }
      }
    });
  }
});

/****************************************************************************************************/

module.exports = router;