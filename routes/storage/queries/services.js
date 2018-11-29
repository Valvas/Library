'use strict'

const express                   = require('express');
const formidable                = require('formidable');
const errors                    = require(`${__root}/json/errors`);
const success                   = require(`${__root}/json/success`);
const constants                 = require(`${__root}/functions/constants`);
const storageAppStrings         = require(`${__root}/json/strings/storage`);
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

var router = express.Router();

/****************************************************************************************************/

router.put('/get-account-rights-towards-service', (req, res) =>
{
  if(req.body.serviceUuid == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'serviceUuid' });

  if(req.app.locals.isAdmin) return res.status(200).send({ isAppAdmin: true, serviceRights: {} });

  storageAppServicesRights.getRightsTowardsService(req.body.serviceUuid, req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, serviceRights) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    return res.status(200).send({ isAppAdmin: false, serviceRights: serviceRights });
  });
});

/****************************************************************************************************/

router.put('/get-account-rights-for-service', (req, res) =>
{
  if(req.body.serviceUuid == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'serviceUuid' });
  if(req.body.accountUuid == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'accountUuid' });

  storageAppServicesRights.getRightsTowardsService(req.body.serviceUuid, req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, requestingAccountServiceRights) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    storageAppServicesRights.getRightsTowardsService(req.body.serviceUuid, req.body.accountUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, requestedAccountServiceRights) =>
    {
      if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      res.status(200).send({ requestedAccountServiceRights: requestedAccountServiceRights, requestingAccountIsGlobalAdmin: req.app.locals.isAdmin, requestingAccountIsServiceAdmin: requestingAccountServiceRights.isAdmin == true });
    });
  });
});

/****************************************************************************************************/

router.put('/download-file', (req, res) =>
{
  var form = new formidable.IncomingForm();

  form.parse(req, (err, fields) =>
  {
    if(err) return res.status(500).send({ result: false, message: errors[constants.COULD_NOT_PARSE_INCOMING_FORM], detail: err.message });

    storageAppFilesDownload.downloadFile(fields.fileUuid, fields.serviceUuid, req.app.locals.account.uuid, req.app.locals.isAdmin, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, filePath, fileName) =>
    {
      if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      storageAppFilesGet.getFileLogs(fields.fileUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, fileData, fileLogs) =>
      {
        if(error == null) req.app.get('io').in(fields.serviceUuid).emit('updateFileLogs', fileData.uuid, fileLogs);
      });

      res.download(filePath, fileName);
    });
  });
});

/****************************************************************************************************/

router.put('/get-file-upload-parameters', (req, res) =>
{
  if(req.body.serviceUuid == undefined) return res.status(406).send({ errorTitle: 'Erreur', errorMessage: errors[constants.MISSING_DATA_IN_REQUEST], errorDetail: `L'UUID du service est manquant dans la requête`, errorHelp: 'Veuillez vous assurer de ne pas avoir modifié le contenu de la page.', errorClose: 'Fermer' });

  storageAppServicesGet.checkIfServiceExistsFromUuid(req.body.serviceUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, serviceExists, serviceData) =>
  {
    if(error != null) return res.status(error.status).send({ errorTitle: 'Erreur critique', errorMessage: errors[error.code], errorDetail: error.detail, errorHelp: 'Veuillez signaler ce problème.', errorClose: 'Fermer' });

    if(serviceExists == false) return res.status(404).send({ errorTitle: 'Erreur critique', errorMessage: errors[constants.SERVICE_NOT_FOUND], errorDetail: `L'UUID fourni dans la requête ne correspond à aucun service`, errorHelp: 'Veuillez vous assurer de ne pas avoir modifié le contenu de la page.', errorClose: 'Fermer' });

    storageAppServicesGet.getAuthorizedExtensionsForService(req.body.serviceUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, serviceExtensions) =>
    {
      if(error != null) return res.status(error.status).send({ errorTitle: 'Erreur critique', errorMessage: errors[error.code], errorDetail: error.detail, errorHelp: 'Veuillez signaler ce problème.', errorClose: 'Fermer' });

      return res.status(200).send({ storageAppStrings: storageAppStrings, uploadParameters: { serviceData: serviceData, authorizedExtensions: serviceExtensions } });
    });
  });
});

/****************************************************************************************************/

router.put('/prepare-upload', (req, res) =>
{
  if(req.body.fileName == undefined)      return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: `Le nom du fichier est manquant dans la requête` });
  if(req.body.fileSize == undefined)      return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: `La taille du fichier est manquant dans la requête` });
  if(req.body.serviceUuid == undefined)   return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: `L'UUID du service est manquant dans la requête` });
  if(req.body.currentFolder == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: `Le dossier courant est manquant dans la requête` });

  storageAppFilesUpload.prepareUpload(req.body.fileName, req.body.fileSize, req.body.serviceUuid, req.body.currentFolder.length === 0 ? null : req.body.currentFolder, req.app.locals.account.uuid, req.app.locals.isAdmin, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, fileAlreadyExists, hasTheRightToRemove) =>
  {
    if(error != null) return res.status(406).send({ message: errors[error.code], errorDetail: error.detail });

    return res.status(200).send({ fileAlreadyExists: fileAlreadyExists, hasTheRightToRemove: hasTheRightToRemove });
  });
});

/****************************************************************************************************/

router.post('/upload-file', (req, res) =>
{
  var form = new formidable.IncomingForm();

  form.uploadDir = `${req.app.get('params').storage.root}/${req.app.get('params').storage.tmp}`;

  form.parse(req, (err, fields, files) =>
  {
    if(Object.keys(files)[0] == undefined || fields.service == undefined  || fields.currentFolder == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: null });

    const currentFileName = files[Object.keys(files)[0]].path.split('\\')[files[Object.keys(files)[0]].path.split('\\').length - 1];

    storageAppFilesUpload.uploadFile(currentFileName, files[Object.keys(files)[0]].name, files[Object.keys(files)[0]].size, fields.service, fields.currentFolder === 'null' ? null : fields.currentFolder, req.app.locals.account.uuid, req.app.locals.isAdmin, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, fileUuid, serviceRights, oldFileUuid) =>
    {
      if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      storageAppFilesGet.getFileFromDatabaseUsingUuid(fileUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, fileExists, fileData) =>
      {
        if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

        if(fileExists == false) return res.status(404).send({ message: errors[constants.FILE_NOT_FOUND], detail: null });

        req.app.get('io').in(fields.service).emit('fileUploaded', fileData, oldFileUuid, fields.currentFolder === 'null' ? null : fields.currentFolder, req.app.locals.account, storageAppStrings);

        return res.status(200).send({ message: success[constants.FILE_SENT_SUCCESSFULLY] });
      });
    });
  });
});

/****************************************************************************************************/

router.post('/create-service', (req, res) =>
{
  const service = JSON.parse(req.body.service);

  if(service.serviceName == undefined)          return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'Service name' });
  if(service.maxFileSize == undefined)          return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'Max file size' });
  if(service.authorizedExtensions == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'Authorized extensions' });

  storageAppAdminServices.createService(service.serviceName, service.maxFileSize, service.authorizedExtensions, req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
  {    
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    return res.status(201).send({ message: success[constants.SERVICE_SUCCESSFULLY_CREATED] });
  });
});

/****************************************************************************************************/

router.post('/remove-service', (req, res) =>
{
  if(req.body.service == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'Service UUID' });

  storageAppAdminServices.removeService(req.body.service, req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    return res.status(200).send({ message: success[constants.SERVICE_SUCCESSFULLY_REMOVED] });
  });
});

/****************************************************************************************************/

router.delete('/remove-files', (req, res) =>
{
  if(req.body.filesToRemove == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'filesToRemove' });

  if(req.body.serviceUuid == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'filesToRemove' });

  storageAppFilesRemove.removeFiles(JSON.parse(req.body.filesToRemove), req.body.serviceUuid, req.app.locals.account.uuid, req.app.locals.isAdmin, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
  {
    if(error != null) return res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail });

    for(var x = 0; x < JSON.parse(req.body.filesToRemove).length; x++)
    {
      req.app.get('io').in(req.body.serviceUuid).emit('fileRemoved', JSON.parse(req.body.filesToRemove)[x], storageAppStrings);

      storageAppFilesGet.getFileLogs(JSON.parse(req.body.filesToRemove)[x], req.app.get('databaseConnectionPool'), req.app.get('params'), (error, fileData, fileLogs) =>
      {
        if(error == null) req.app.get('io').in(req.body.serviceUuid).emit('updateFileLogs', fileData.uuid, fileLogs);
      });
    }

    res.status(200).send({ message: success[constants.FILES_SUCCESSFULLY_REMOVED] });
  });
});

/****************************************************************************************************/

router.put('/update-service-name', (req, res) =>
{
  if(req.body.serviceUuid == undefined || req.body.serviceName == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: null });

  else
  {
    storageAppAdminServices.updateServiceName(req.body.serviceUuid, req.body.serviceName, req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
    {
      if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      else
      {
        res.status(200).send({ message: success[constants.SERVICE_LABEL_SUCCESSFULLY_UPDATED] });
      }
    });
  }
});

/****************************************************************************************************/

router.put('/get-folder-content', (req, res) =>
{
  if(req.body.folderUuid == undefined)  return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'folderUuid' });
  if(req.body.serviceUuid == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'serviceUuid' });

  storageAppFilesGet.checkIfFolderExistsInDatabase(req.body.folderUuid.length === 0 ? null : req.body.folderUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, folderExists, folderData) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    if(folderExists == false && req.body.folderUuid.length > 0) return res.status(404).send({ message: errors[constants.FOLDER_NOT_FOUND], detail: null });

    storageAppServicesRights.getRightsTowardsService(req.body.serviceUuid, req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, serviceRights) =>
    {
      if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      storageAppFilesGet.getFilesFromService(req.body.serviceUuid, req.body.folderUuid.length === 0 ? null : req.body.folderUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, filesAndFolders) =>
      {
        if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

        if(req.body.folderUuid.length === 0) return res.status(200).send({ elements: filesAndFolders, parentFolder: folderData, folderPath: [], storageAppStrings: storageAppStrings, serviceRights: serviceRights, isGlobalAdmin: req.app.locals.isAdmin });
      
        storageAppFilesGet.getFolderPath(req.body.folderUuid, [], req.app.get('databaseConnectionPool'), req.app.get('params'), (error, folderPath) =>
        {
          if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

          return res.status(200).send({ elements: filesAndFolders, parentFolder: folderData, folderPath: folderPath.reverse(), storageAppStrings: storageAppStrings, serviceRights: serviceRights, isGlobalAdmin: req.app.locals.isAdmin });
        });
      });
    });
  });
});

/****************************************************************************************************/

router.post('/create-new-folder', (req, res) =>
{
  if(req.body.parentFolderUuid == undefined)  return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'parentFolderUuid' });
  if(req.body.newFolderName == undefined)     return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'newFolderName' });
  if(req.body.serviceUuid == undefined)       return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'serviceUuid' });

  storageAppFilesCreate.createFolder(req.body.newFolderName, req.body.parentFolderUuid.length === 0 ? null : req.body.parentFolderUuid, req.body.serviceUuid, req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, folderUuid) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });
    
    storageAppFilesGet.checkIfFolderExistsInDatabase(folderUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, folderExists, folderData) =>
    {
      if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      if(folderExists == false) return res.status(404).send({ message: errors[constants.FOLDER_NOT_FOUND], detail: null });

      req.app.get('io').in(req.body.serviceUuid).emit('folderCreated', folderData, req.body.parentFolderUuid.length === 0 ? null : req.body.parentFolderUuid, req.app.locals.account, storageAppStrings);
    
      return res.status(201).send({ message: success[constants.NEW_FOLDER_SUCCESSFULLY_CREATED] });
    });
  });
});

/****************************************************************************************************/

router.put('/update-folder-name', (req, res) =>
{
  if(req.body.folderUuid == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'folderUuid' });

  else if(req.body.newFolderName == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'newFolderName' });

  else if(req.body.serviceUuid == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'serviceUuid' });

  else
  {
    storageAppFilesSet.setNewFolderName(req.body.folderUuid, req.body.newFolderName, req.body.serviceUuid, req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
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
  if(req.body.fileUuid == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'fileUuid' });

  storageAppFilesGet.getFileLogs(req.body.fileUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, fileData, fileLogs) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    return res.status(200).send({ fileData: fileData, fileLogs: fileLogs });
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
    storageAppFilesComment.addCommentToFile(req.body.fileComment, req.body.fileUuid, req.body.serviceUuid, req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
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