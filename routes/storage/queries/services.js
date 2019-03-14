'use strict'

const express                   = require('express');
const formidable                = require('formidable');
const errors                    = require(`${__root}/json/errors`);
const success                   = require(`${__root}/json/success`);
const constants                 = require(`${__root}/functions/constants`);
const storageAppStrings         = require(`${__root}/json/strings/storage`);
const storageAppFilesGet        = require(`${__root}/functions/storage/files/get`);
const storageAppAdminGet        = require(`${__root}/functions/storage/admin/get`);
const storageAppFilesCreate     = require(`${__root}/functions/storage/files/create`);
const storageAppServicesGet     = require(`${__root}/functions/storage/services/get`);
const storageAppFilesUpload     = require(`${__root}/functions/storage/files/upload`);
const storageAppFilesRemove     = require(`${__root}/functions/storage/files/remove`);
const storageAppLogsServices    = require(`${__root}/functions/storage/logs/services`);
const storageAppFoldersUpdate   = require(`${__root}/functions/storage/folders/update`);
const storageAppFoldersRemove   = require(`${__root}/functions/storage/folders/remove`);
const storageAppFilesDownload   = require(`${__root}/functions/storage/files/download`);
const storageAppAdminServices   = require(`${__root}/functions/storage/admin/services`);
const storageAppServicesRights  = require(`${__root}/functions/storage/services/rights`);

var router = express.Router();

/****************************************************************************************************/

router.post('/get-rights-on-service', (req, res) =>
{
  const currentAccount = req.app.locals.account;

  if(req.body.serviceUuid == undefined)
  {
    return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'serviceUuid' });
  }

  storageAppServicesRights.getRightsTowardsService(req.body.serviceUuid, currentAccount.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, serviceRights) =>
  {
    if(error != null)
    {
      return res.status(error.status).send({ message: errors[error.code], detail: error.detail });
    }

    const rights =
    {
      isAdmin: currentAccount.isAdmin || serviceRights.isAdmin,
      accessService: serviceRights.accessService,
      postComments: serviceRights.postComments,
      uploadFiles: serviceRights.uploadFiles,
      createFolders: serviceRights.createFolders,
      downloadFiles: serviceRights.downloadFiles,
      moveFiles: serviceRights.moveFiles,
      renameFolders: serviceRights.renameFolders,
      removeFolders: serviceRights.removeFolders,
      restoreFiles: serviceRights.restoreFiles,
      removeFiles: serviceRights.removeFiles,
      editOwnCommentsOnFile: serviceRights.editOwnCommentsOnFile,
      editAllCommentsOnFile: serviceRights.editAllCommentsOnFile,
      removeOwnCommentsOnFile: serviceRights.removeOwnCommentsOnFile,
      removeAllCommentsOnFile: serviceRights.removeAllCommentsOnFile
    }

    return res.status(200).send(rights);
  });
});

/****************************************************************************************************/

router.put('/get-account-rights-towards-service', (req, res) =>
{
  const currentAccount = req.app.locals.account;

  if(req.body.serviceUuid == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'serviceUuid' });

  if(currentAccount.isAdmin) return res.status(200).send({ isAppAdmin: true });

  storageAppServicesRights.getRightsTowardsService(req.body.serviceUuid, currentAccount.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, serviceRights) =>
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
  const currentAccount = req.app.locals.account;
  var form = new formidable.IncomingForm();

  form.parse(req, (err, fields) =>
  {
    if(err) return res.status(500).send({ result: false, message: errors[constants.COULD_NOT_PARSE_INCOMING_FORM], detail: err.message });

    storageAppFilesDownload.downloadFile(fields.fileUuid, fields.serviceUuid, currentAccount.uuid, currentAccount.isAdmin, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, filePath, fileName, isAppAdmin, accountRightsOnService) =>
    {
      if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      storageAppFilesGet.getFileLogs(fields.fileUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, fileData, fileLogs) =>
      {
        if(error == null) req.app.get('io').in(fields.serviceUuid).emit('updateFileLogs', fileData.uuid, req.app.locals.account.uuid, isAppAdmin, accountRightsOnService, fileLogs, storageAppStrings);
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

router.post('/get-files-data', (req, res) =>
{
  if(req.body.filesToDownload == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: `Aucun identifiant de fichier dans la requête` });
  if(req.body.serviceUuid == undefined)     return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: `L'identifiant du service est manquant dans la requête` });

  const filesToDownload = req.body.filesToDownload.split(',');

  storageAppFilesGet.retrieveFilesData(filesToDownload, req.body.serviceUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, filesData) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], errorDetail: error.detail });

    return res.status(200).send(filesData);
  });
});

/****************************************************************************************************/

router.put('/prepare-upload', (req, res) =>
{
  const currentAccount = req.app.locals.account;

  if(req.body.fileName == undefined)      return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: `Le nom du fichier est manquant dans la requête` });
  if(req.body.fileSize == undefined)      return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: `La taille du fichier est manquant dans la requête` });
  if(req.body.serviceUuid == undefined)   return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: `L'UUID du service est manquant dans la requête` });
  if(req.body.currentFolder == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: `Le dossier courant est manquant dans la requête` });

  storageAppFilesUpload.prepareUpload(req.body.fileName, req.body.fileSize, req.body.serviceUuid, req.body.currentFolder.length === 0 ? null : req.body.currentFolder, currentAccount.uuid, currentAccount.isAdmin, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, fileAlreadyExists, hasTheRightToRemove) =>
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

    const currentFileName = files[Object.keys(files)[0]].path.split('\\').length > 1
    ? files[Object.keys(files)[0]].path.split('\\')[files[Object.keys(files)[0]].path.split('\\').length - 1]
    : files[Object.keys(files)[0]].path.split('/')[files[Object.keys(files)[0]].path.split('/').length - 1];

    storageAppFilesUpload.uploadFile(currentFileName, files[Object.keys(files)[0]].name, files[Object.keys(files)[0]].size, fields.service, fields.currentFolder === 'null' ? null : fields.currentFolder, req.app.locals.account.uuid, req.app.locals.isAdmin, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, fileUuid, serviceRights, oldFileUuid) =>
    {
      if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      storageAppFilesGet.getFileFromDatabaseUsingUuid(fileUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, fileExists, fileData) =>
      {
        if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

        if(fileExists == false) return res.status(404).send({ message: errors[constants.FILE_NOT_FOUND], detail: null });

        req.app.get('io').in(fields.service).emit('fileUploaded', fileData, oldFileUuid, fields.currentFolder === 'null' ? null : fields.currentFolder, req.app.locals.account, storageAppStrings);
        if(oldFileUuid == null) req.app.get('io').in('storageAppHome').emit('homeFileUploaded', fields.service);

        req.app.get('io').in('storageAppService').emit('serviceFileUploaded', fields.service, fileData);

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

  const filesToRemove = JSON.parse(req.body.filesToRemove);

  storageAppFilesRemove.removeFilesFromService(filesToRemove, req.body.serviceUuid, req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    for(var x = 0; x < filesToRemove.length; x++)
    {
      req.app.get('io').in(req.body.serviceUuid).emit('fileRemoved', filesToRemove[x], storageAppStrings);
      req.app.get('io').in('storageAppService').emit('serviceFileRemoved', filesToRemove[x]);
      req.app.get('io').in('storageAppHome').emit('homeFileRemoved', req.body.serviceUuid);
    }

    res.status(200).send({ message: success[constants.FILES_SUCCESSFULLY_REMOVED] });
  });
});

/****************************************************************************************************/

router.put('/update-service-name', (req, res) =>
{
  const currentAccount = req.app.locals.account;

  if(req.body.serviceUuid == undefined || req.body.serviceName == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: null });

  else
  {
    storageAppAdminServices.updateServiceName(req.body.serviceUuid, req.body.serviceName, currentAccount.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
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
      req.app.get('io').in('storageAppHome').emit('homeFolderCreated', req.body.serviceUuid);
      req.app.get('io').in('storageAppService').emit('serviceFolderCreated', req.body.serviceUuid, folderData);

      return res.status(201).send({ message: success[constants.NEW_FOLDER_SUCCESSFULLY_CREATED] });
    });
  });
});

/****************************************************************************************************/

router.put('/update-folder-name', (req, res) =>
{
  if(req.body.folderUuid == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'folderUuid' });
  if(req.body.newFolderName == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'newFolderName' });

  storageAppFoldersUpdate.updateFolderName(req.body.newFolderName, req.body.folderUuid, req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, serviceUuid) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    req.app.get('io').in(serviceUuid).emit('folderNameUpdated', req.body.folderUuid, req.body.newFolderName, storageAppStrings);
    req.app.get('io').in('storageAppService').emit('serviceFolderRenamed', { uuid: req.body.folderUuid, name: req.body.newFolderName });

    return res.status(200).send({ message: success[constants.FOLDER_NAME_UPDATED] });
  });
});

/****************************************************************************************************/

router.put('/get-file-logs', (req, res) =>
{
  if(req.body.fileUuid == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'fileUuid' });

  if(req.body.serviceUuid == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'serviceUuid' });

  storageAppAdminGet.checkIfAccountIsAdmin(req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, isAppAdmin) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    storageAppServicesRights.getRightsTowardsService(req.body.serviceUuid, req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, accountRightsOnService) =>
    {
      if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      storageAppFilesGet.getFileLogs(req.body.fileUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, fileData, fileLogs) =>
      {
        if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

        return res.status(200).send({ fileData: fileData, fileLogs: fileLogs, accountRightsOnService: accountRightsOnService, accountData: req.app.locals.account, isAppAdmin: isAppAdmin });
      });
    });
  });
});

/****************************************************************************************************/

router.post('/post-file-comment', (req, res) =>
{
  if(req.body.fileUuid == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'fileUuid' });

  if(req.body.fileComment == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'fileComment' });

  storageAppLogsServices.addCommentFileLog(req.body.fileComment, req.body.fileUuid, req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, serviceUuid, isAppAdmin, accountRightsOnService) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    storageAppFilesGet.getFileLogs(req.body.fileUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, fileData, fileLogs) =>
    {
      if(error == null) req.app.get('io').in(serviceUuid).emit('updateFileLogs', req.body.fileUuid, req.app.locals.account.uuid, isAppAdmin, accountRightsOnService, fileLogs, storageAppStrings);
    });

    res.status(200).send({ message: success[constants.FILE_COMMENT_SUCCESSFULLY_ADDED] });
  });
});

/****************************************************************************************************/

router.delete('/remove-file-comment', (req, res) =>
{
  if(req.body.commentUuid == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'commentUuid' });

  if(req.body.serviceUuid == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'serviceUuid' });

  storageAppLogsServices.removeFileCommentLog(req.body.commentUuid, req.app.locals.account.uuid, req.body.serviceUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    req.app.get('io').in(req.body.serviceUuid).emit('fileCommentRemoved', req.body.commentUuid, storageAppStrings);

    return res.status(200).send({ message: success[constants.FILE_COMMENT_SUCCESSFULLY_REMOVED] });
  });
});

/****************************************************************************************************/

router.put('/update-file-comment', (req, res) =>
{
  if(req.body.commentUuid == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'commentUuid' });

  if(req.body.serviceUuid == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'serviceUuid' });

  if(req.body.newCommentContent == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'newCommentContent' });

  storageAppLogsServices.updateFileCommentLog(req.body.newCommentContent, req.body.commentUuid, req.app.locals.account.uuid, req.body.serviceUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    req.app.get('io').in(req.body.serviceUuid).emit('fileCommentUpdated', req.body.commentUuid, req.body.newCommentContent);

    return res.status(200).send({ message: success[constants.FILE_COMMENT_SUCCESSFULLY_UPDATED] });
  });
});

/****************************************************************************************************/

router.delete('/remove-folder', (req, res) =>
{
  if(req.body.folderUuid == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'folderUuid' });

  if(req.body.serviceUuid == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'serviceUuid' });

  storageAppFoldersRemove.removeFolder(req.body.folderUuid, req.body.serviceUuid, req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, removedFolders, removedFiles) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    for(var x = 0; x < removedFolders.length; x++)
    {
      req.app.get('io').in(req.body.serviceUuid).emit('folderRemoved', removedFolders[x], storageAppStrings);
      req.app.get('io').in('storageAppHome').emit('homeFolderRemoved', req.body.serviceUuid);
      req.app.get('io').in('storageAppService').emit('serviceFolderRemoved', req.body.serviceUuid, removedFolders[x]);
    }

    for(var x = 0; x < removedFiles; x++)
    {
      req.app.get('io').in('storageAppHome').emit('homeFileRemoved', req.body.serviceUuid);
    }

    return res.status(200).send({ message: success[constants.FOLDER_SUCCESSFULLY_REMOVED] });
  });
});

/****************************************************************************************************/

router.get('/get-services', (req, res) =>
{
  const currentAccount = req.app.locals.account;

  storageAppServicesGet.getServicesData(req.app.get('databaseConnectionPool'), req.app.get('params'), (error, services) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    if(Object.keys(services).length === 0) return res.status(200).send({  });

    var index = 0;

    var browseServices = () =>
    {
      storageAppServicesRights.getRightsTowardsService(Object.keys(services)[index], currentAccount.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, serviceRights) =>
      {
        if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

        services[Object.keys(services)[index]].hasAccess = currentAccount.isAdmin == true || serviceRights.accessService == true || serviceRights.isAdmin == true;

        if(Object.keys(services)[index += 1] == undefined) return res.status(200).send(services);

        browseServices();
      });
    }

    browseServices();
  });
});

/****************************************************************************************************/

module.exports = router;
