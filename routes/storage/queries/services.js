'use strict'

const express                   = require('express');
const formidable                = require('formidable');
const params                    = require(`${__root}/json/params`);
const errors                    = require(`${__root}/json/errors`);
const success                   = require(`${__root}/json/success`);
const commonAppStrings          = require(`${__root}/json/strings/common`);
const constants                 = require(`${__root}/functions/constants`);
const storageAppStrings         = require(`${__root}/json/strings/storage`);
const storageAppAdminGet        = require(`${__root}/functions/storage/admin/get`);
const storageAppFilesGet        = require(`${__root}/functions/storage/files/get`);
const storageAppFilesSet        = require(`${__root}/functions/storage/files/set`);
const storageAppFilesCreate     = require(`${__root}/functions/storage/files/create`);
const storageAppServicesGet     = require(`${__root}/functions/storage/services/get`);
const storageAppFilesUpload     = require(`${__root}/functions/storage/files/upload`);
const storageAppFilesRemove     = require(`${__root}/functions/storage/files/remove`);
const storageAppFilesComment    = require(`${__root}/functions/storage/files/comment`);
const storageAppFilesDownload   = require(`${__root}/functions/storage/files/download`);
const storageAppAdminServices   = require(`${__root}/functions/storage/admin/services`);
const storageAppServicesRights  = require(`${__root}/functions/storage/services/rights`);

const commonAccountsGet         = require(`${__root}/functions/common/accounts/get`);

var router = express.Router();

/****************************************************************************************************/

router.put('/get-rights-for-service', (req, res) =>
{
  if(req.body.serviceUuid == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'serviceUuid' });

  else
  {
    storageAppServicesRights.getRightsTowardsService(req.body.serviceUuid, req.session.account.id, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, rights) =>
    {
      if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      else
      {
        res.status(200).send({ rights: rights });
      }
    });
  }
});

/****************************************************************************************************/

router.put('/get-account-rights-for-service', (req, res) =>
{
  if(req.body.serviceUuid == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'serviceUuid' });

  else if(req.body.accountUuid == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'accountUuid' });

  else
  {
    commonAccountsGet.checkIfAccountExistsFromUuid(req.body.accountUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, accountExists, accountData) =>
    {
      if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      else if(accountExists == false) res.status(404).send({ message: errors[constants.ACCOUNT_NOT_FOUND], detail: null });

      else
      {
        storageAppServicesRights.getRightsTowardsService(req.body.serviceUuid, accountData.id, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, rights) =>
        {
          if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

          else
          {
            res.status(200).send({ rights: rights });
          }
        });
      }
    });
  }
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
      storageAppFilesDownload.downloadFile(fields.fileUuid, fields.serviceUuid, req.session.account.id, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, filePath) =>
      {
        if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

        else
        {
          res.download(filePath, fields.fileUuid);
        }
      });
    }
  });
});

/****************************************************************************************************/

router.post('/get-file-upload-parameters', (req, res) =>
{
  if(req.body.serviceUuid == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: null });

  else
  {
    storageAppServicesGet.getServiceUsingUUID(req.body.serviceUuid, req.app.get('databaseConnectionPool'), (error, service) =>
    {
      if(error != null) res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail });

      else
      {
        storageAppServicesGet.getFileMaxSize(service.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, serviceFilesMaxSize) =>
        {
          if(error != null) res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail });

          else
          {
            storageAppServicesGet.getAuthorizedExtensionsForService(service.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, serviceExtensions) =>
            {
              if(error != null) res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail });

              else
              {
                res.status(200).send({ strings: { common: commonAppStrings, storage: storageAppStrings }, size: serviceFilesMaxSize, ext: serviceExtensions });
              }
            });
          }
        });
      }
    });
  }
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
      fields.service        == undefined ||
      fields.currentFolder  == undefined ||
      fields.file           == undefined ?

      res.status(406).send({ result: false, message: errors[constants.MISSING_DATA_IN_REQUEST], detail: null }) :

      storageAppFilesUpload.prepareUpload(JSON.parse(fields.file).name.split('.')[0], JSON.parse(fields.file).name.split('.')[1], JSON.parse(fields.file).size, fields.service, fields.currentFolder, req.session.account.id, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, fileAlreadyExists, authorizedToRemoveExistingFile) =>
      {
        if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

        if(fileAlreadyExists == false) res.status(200).send({ strings: { common: commonAppStrings, storage: storageAppStrings }, fileExists: false });

        else
        {
          res.status(200).send({ strings: { common: commonAppStrings, storage: storageAppStrings }, fileExists: true, rightToRemove: authorizedToRemoveExistingFile });
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
  {
    Object.keys(files)[0] == undefined || fields.service == undefined  || fields.currentFolder == undefined ? res.status(406).send({ result: false, message: errors[constants.MISSING_DATA_IN_REQUEST] }) :

    storageAppFilesUpload.uploadFile(files[Object.keys(files)[0]].name.split('.')[0], files[Object.keys(files)[0]].name.split('.')[1], files[Object.keys(files)[0]].size, files[Object.keys(files)[0]].path, fields.service, fields.currentFolder, req.session.account.id, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, fileUuid) =>
    {
      error != null ?
      res.status(error.status).send({ message: errors[error.code], detail: error.detail }) :
      res.status(200).send({ message: success[constants.FILE_SENT_SUCCESSFULLY], fileUuid: fileUuid });
    });
  });
});

/****************************************************************************************************/

router.post('/create-service', (req, res) =>
{
  const service = JSON.parse(req.body.service);

  if(service.serviceName == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'Service name' });

  else if(service.maxFileSize == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'Max file size' });

  else if(service.authorizedExtensions == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'Authorized extensions' });

  else
  {
    req.app.get('databaseConnectionPool').getConnection((error, connection) =>
    {
      if(error) res.status(500).send({ message: errors[constants.SQL_SERVER_ERROR], detail: error.message });

      else
      {
        storageAppAdminServices.createService(service.serviceName, service.maxFileSize, service.authorizedExtensions, req.session.account.id, connection, req.app.get('params'), (error) =>
        {
          connection.release();
          
          error != null

          ? res.status(error.status).send({ message: errors[error.code], detail: error.detail })
          : res.status(201).send({ message: success[constants.SERVICE_SUCCESSFULLY_CREATED] });
        });
      }
    });
  }
});

/****************************************************************************************************/

router.post('/remove-service', (req, res) =>
{
  if(req.body.service == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'Service UUID' });

  else
  {
    storageAppAdminServices.removeService(req.body.service, req.session.account.id, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
    {
      if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      else
      {
        res.status(200).send({ message: success[constants.SERVICE_SUCCESSFULLY_REMOVED] });
      }
    });
  }
});

/****************************************************************************************************/

router.delete('/remove-files', (req, res) =>
{
  if(req.body.filesToRemove == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'filesToRemove' });

  else if(req.body.serviceUuid == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'filesToRemove' });

  else
  {
    storageAppFilesRemove.removeFiles(JSON.parse(req.body.filesToRemove), req.body.serviceUuid, req.session.account.id, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
    {
      if(error != null) res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail });

      else
      {
        res.status(200).send({  });
      }
    });
  }
});

/****************************************************************************************************/

router.post('/modify-service-label', (req, res) =>
{
  if(req.body.serviceUuid == undefined || req.body.serviceLabel == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: null });

  else
  {
    storageAppServicesGet.getServiceUsingUUID(req.body.serviceUuid, req.app.get('mysqlConnector'), (error, service) =>
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
              storageAppAdminServices.updateServiceName(req.body.serviceUuid, req.body.serviceLabel, req.app.get('mysqlConnector'), req.app.get('params'), (error) =>
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

router.put('/get-folder-content', (req, res) =>
{
  if(req.body.folderUuid == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'folderUuid' });

  else if(req.body.serviceUuid == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'serviceUuid' });

  else
  {
    storageAppFilesGet.getFilesFromService(req.body.serviceUuid, req.session.account.id, req.body.folderUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, filesAndFolders) =>
    {
      if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      else
      {
        res.status(200).send({ result: filesAndFolders });
      }
    });
  }
});

/****************************************************************************************************/

router.put('/get-parent-folder', (req, res) =>
{
  if(req.body.folderUuid == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'folderUuid' });

  else if(req.body.serviceUuid == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'serviceUuid' });

  else
  {
    storageAppFilesGet.getParentFolder(req.body.folderUuid, req.body.serviceUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, isRoot, folderData) =>
    {
      if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      else
      {
        storageAppFilesGet.getFilesFromService(req.body.serviceUuid, req.session.account.id, isRoot ? null : folderData.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, filesAndFolders) =>
        {
          if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

          else
          {
            res.status(200).send({ result: filesAndFolders });
          }
        });
      }
    });
  }
});

/****************************************************************************************************/

router.post('/create-new-folder', (req, res) =>
{
  if(req.body.parentFolderUuid == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'parentFolderUuid' });

  else if(req.body.newFolderName == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'newFolderName' });

  else if(req.body.serviceUuid == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'serviceUuid' });

  else
  {
    storageAppFilesCreate.createNewFolder(req.body.newFolderName, req.body.parentFolderUuid, req.body.serviceUuid, req.session.account.id, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, folderUuid) =>
    {
      if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });
      
      else
      {
        res.status(201).send({ message: success[constants.NEW_FOLDER_SUCCESSFULLY_CREATED], folderUuid: folderUuid });
      }
    });
  }
});

/****************************************************************************************************/

router.put('/update-folder-name', (req, res) =>
{
  if(req.body.folderUuid == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'folderUuid' });

  else if(req.body.newFolderName == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'newFolderName' });

  else if(req.body.serviceUuid == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'serviceUuid' });

  else
  {
    storageAppFilesSet.setNewFolderName(req.body.folderUuid, req.body.newFolderName, req.body.serviceUuid, req.session.account.id, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
    {
      if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      else
      {
        res.status(200).send({ message: success[constants.FOLDER_NAME_UPDATED] });
      }
    });
  }
});

/****************************************************************************************************/

router.put('/get-file-logs', (req, res) =>
{
  if(req.body.fileUuid == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'fileUuid' });

  storageAppFilesGet.getFileLogs(req.body.fileUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, fileData, fileLogs) =>
  {
    if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    else
    {
      res.status(200).send({ fileData: fileData, fileLogs: fileLogs });
    }
  });
});

/****************************************************************************************************/

router.post('/post-file-comment', (req, res) =>
{
  if(req.body.fileUuid == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'fileUuid' });

  else if(req.body.serviceUuid == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'serviceUuid' });

  else if(req.body.fileComment == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'serviceUuid' });

  else
  {
    storageAppFilesComment.addCommentToFile(req.body.fileComment, req.body.fileUuid, req.body.serviceUuid, req.session.account.id, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
    {
      if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      else
      {
        res.status(200).send({ message: success[constants.FILE_COMMENT_SUCCESSFULLY_ADDED] });
      }
    });
  }
});

/****************************************************************************************************/

module.exports = router;