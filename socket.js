'use strict'

const success                     = require(`${__root}/json/success`);
const constants                   = require(`${__root}/functions/constants`);
const accountsGet                 = require(`${__root}/functions/accounts/get`);
const storageAppFilesGet          = require(`${__root}/functions/storage/files/get`);
const commonAccountsGet           = require(`${__root}/functions/common/accounts/get`);
const storageAppServicesGet       = require(`${__root}/functions/storage/services/get`);

/****************************************************************************************************/

module.exports = (io, app, callback) =>
{
  io.on('connection', (socket) =>
  {
    socket.on('adminAppAccountsHomeJoin', () => { socket.join('adminAppAccountsHome'); });
    socket.on('adminAppAccountsDetailJoin', (accountUUID) => { socket.join(accountUUID); })
    socket.on('storageAppServicesDetailJoin', (serviceUuid) => { socket.join(serviceUuid); });
    socket.on('storageAppAdminServicesList', () => { socket.join('storageAppAdminServicesList'); });
    socket.on('adminAppRightsDetailJoin', (accountUUID) => { socket.join('adminAppRightsDetail ' + accountUUID); });
    socket.on('adminAppAccessDetailJoin', (accountUUID) => { socket.join('adminAppAccessDetail ' + accountUUID); });
    socket.on('storageAppAdminServiceDetailJoin', (serviceName) => { socket.join('admin' + serviceName); });
    socket.on('storageAppAdminServicesRightsJoin', () => { socket.join('adminServicesRights'); });

    /****************************************************************************************************/
    // EVENTS FOR NEWS ON ROOT APP
    /****************************************************************************************************/

    socket.on('rootNewsJoin', () => { socket.join('rootNewsGroup') });

    /****************************************************************************************************/
    /****************************************************************************************************/

    socket.on('accountCreated', (accountEmail) => 
    {
      accountsGet.getAccountUsingEmail(accountEmail, app.get('mysqlConnector'), (error, account) =>
      {
        if(error == null) io.in('adminAppAccountsHome').emit('accountCreated', null, account);
      });
    });

    socket.on('accountModified', (accountUUID) =>
    {
      accountsGet.getAccountUsingUUID(accountUUID, app.get('mysqlConnector'), (error, account) =>
      {
        if(error == null) io.in('adminAppAccountsHome').emit('accountModified', null, account);
      });
    });

    socket.on('accountRemoved', (accountUUID) =>
    {
      io.in('adminAppAccountsHome').emit('accountRemovedOnHome', null, accountUUID);
      socket.to(accountUUID).emit('accountRemovedOnDetail');
    });

    socket.on('accountRightsUpdated', (accountUUID, rights, strings) =>
    {
      io.in('adminAppRightsDetail ' + accountUUID).emit('updateRights', null, rights, strings);
    });

    socket.on('accountAccessUpdated', (accountUUID, access, strings) =>
    {
      io.in('adminAppAccessDetail ' + accountUUID).emit('updateAccess', null, access, strings);
    });

    socket.on('storageAppServicesFolderCreated', (folderUuid, serviceUuid, parentFolderUuid) =>
    {
      storageAppFilesGet.checkIfFolderExistsInDatabase(folderUuid, app.get('databaseConnectionPool'), app.get('params'), (error, folderExists, folderData) =>
      {
        if(error == null && folderExists) io.in(serviceUuid).emit('folderCreated', folderData, parentFolderUuid);
      });
    });

    socket.on('storageAppServicesFolderNameUpdated', (folderUuid, serviceUuid, newFolderName) =>
    {
      io.in(serviceUuid).emit('folderNameUpdated', folderUuid, newFolderName);
    });

    /****************************************************************************************************/
    // MANAGE EVENTS ON FILES IN APPLICATION STORAGE
    /****************************************************************************************************/

    socket.on('storageAppServicesfileUploaded', (fileUuid, serviceUuid, folderUuid) =>
    {
      storageAppFilesGet.getFileFromDatabaseUsingUuid(fileUuid, app.get('databaseConnectionPool'), app.get('params'), (error, fileExists, fileData) =>
      {
        if(error == null)
        {
          fileData.extension = fileData.ext;
          io.in(serviceUuid).emit('fileUploaded', fileData, folderUuid);
        }
      });
    });

    /****************************************************************************************************/

    socket.on('storageAppServicesFileRemoved', (fileUuid, serviceUuid) =>
    {
      io.in(serviceUuid).emit('fileRemoved', fileUuid);
    });

    /****************************************************************************************************/

    socket.on('storageAppServicesFileDownloaded', (fileUuid, serviceUuid) =>
    {
      storageAppFilesGet.getFileLogs(fileUuid, app.get('databaseConnectionPool'), app.get('params'), (error, fileData, fileLogs) =>
      {
        if(error == null) io.in(serviceUuid).emit('updateFileLogs', fileUuid, fileLogs);
      });
    });

    /****************************************************************************************************/

    socket.on('storageAppServicesFileCommented', (fileUuid, serviceUuid) =>
    {
      storageAppFilesGet.getFileLogs(fileUuid, app.get('databaseConnectionPool'), app.get('params'), (error, fileData, fileLogs) =>
      {
        if(error == null) io.in(serviceUuid).emit('updateFileLogs', fileUuid, fileLogs);
      });
    });

    /****************************************************************************************************/

    socket.on('storageAppAdminServiceRemoved', (serviceUuid) =>
    {
      io.in('storageAppAdminServicesList').emit('serviceRemoved', serviceUuid);
    });

    socket.on('storageAppAdminServiceLabelUpdated', (serviceUuid, serviceName) =>
    {
      io.in('admin' + serviceUuid).emit('serviceNameUpdated', serviceName, success[constants.SERVICE_LABEL_SUCCESSFULLY_UPDATED]);
    });

    socket.on('storageAppAdminServiceFileSizeUpdated', (serviceUuid, serviceFileSize) =>
    {
      io.in('admin' + serviceUuid).emit('serviceFileSizeUpdated', serviceFileSize, success[constants.SERVICE_MAX_FILE_SIZE_SUCCESSFULLY_UPDATED]);
    });

    socket.on('storageAppAdminServiceExtensionsUpdated', (serviceUuid) =>
    {
      storageAppServicesGet.getAuthorizedExtensionsForService(serviceUuid, app.get('databaseConnectionPool'), app.get('params'), (error, serviceExtensions, allExtensions) =>
      {
        if(error == null) io.in('admin' + serviceUuid).emit('serviceExtensionsUpdated', serviceExtensions, allExtensions, success[constants.SERVICE_EXTENSIONS_SUCCESSFULLY_UPDATED]);
      });
    });

    socket.on('storageAppAdminServicesRightsAccountAddedToMembers', (account) =>
    {
      io.in('adminServicesRights').emit('accountAddedToMembers', account);
    });

    socket.on('storageAppAdminServicesRightsAccountRemovedFromMembers', (accountUuid, serviceUuid) =>
    {
      commonAccountsGet.checkIfAccountExistsFromUuid(accountUuid, app.get('databaseConnectionPool'), app.get('params'), (error, accountExists, accountData) =>
      {
        if(error == null && accountExists) io.in('adminServicesRights').emit('accountRemovedFromMembers', accountData, serviceUuid);
      });
    });

    socket.on('accountRightsUpdatedOnService', (accountUuid, accountRights, serviceUuid) =>
    {
      commonAccountsGet.checkIfAccountExistsFromUuid(accountUuid, app.get('databaseConnectionPool'), app.get('params'), (error, accountExists, accountData) =>
      {
        if(error == null && accountExists) io.in('adminServicesRights').emit('accountRightsUpdatedOnService', accountData, accountRights, serviceUuid);
      });
    });

    socket.on('storageAppAdminServicesRightAddedToMember', (accountUUID, right) =>
    {
      io.in('adminServicesRights').emit('rightAddedToMember', accountUUID, right);
    });

    socket.on('storageAppAdminServicesRightRemovedToMember', (accountUUID, right) =>
    {
      io.in('adminServicesRights').emit('rightRemovedToMember', accountUUID, right);
    });
  });

  return callback();
}

/****************************************************************************************************/