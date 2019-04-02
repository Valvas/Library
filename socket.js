'use strict'

const storageAppStrings           = require(`${__root}/json/strings/storage`);
const storageAppFilesGet          = require(`${__root}/functions/storage/files/get`);

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

    socket.on('messengerJoinConversation', (conversationUuid) => { socket.join(conversationUuid) });
    socket.on('messengerAwaitingNewConversationsJoin', () => { socket.join('messengerAwaitingNewConversations') });

    socket.on('storageAppHomeJoin', () => { socket.join('storageAppHome') });
    socket.on('storageAppHomeLeave', () => { socket.leave('storageAppHome') });

    socket.on('storageAppServiceJoin', () => { socket.join('storageAppService') });
    socket.on('storageAppServiceLeave', () => { socket.leave('storageAppService') });

    socket.on('intranetBugsJoin', () => { socket.join('intranetBugs') });

    /****************************************************************************************************/
    /* Events Rooms On Intranet Home */
    /****************************************************************************************************/

    socket.on('intranetArticlesJoin', () =>
    {
      socket.join('intranetArticlesRoom');
    });

    socket.on('intranetAppsJoin', () =>
    {
      socket.join('intranetAppsRoom');
    });

    socket.on('intranetAccountJoin', (accountUuid) =>
    {
      socket.join('intranetAccountRoom' + accountUuid);
    });

    socket.on('intranetDirectoryJoin', () =>
    {
      socket.join('intranetDirectoryRoom');
    });

    socket.on('intranetArticlesLeave', () =>
    {
      socket.leave('intranetArticlesRoom');
    });

    socket.on('intranetAppsLeave', () =>
    {
      socket.leave('intranetAppsRoom');
    });

    socket.on('intranetAccountLeave', (accountUuid) =>
    {
      socket.leave('intranetAccountRoom' + accountUuid);
    });

    socket.on('intranetDirectoryLeave', () =>
    {
      socket.leave('intranetDirectoryRoom');
    });

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
        if(error != null) return;

        if(fileExists == false) return;

        io.in(serviceUuid).emit('fileUploaded', fileData, folderUuid);
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
    // STORAGE APP ADMIN SERVICE EVENTS
    /****************************************************************************************************/

    socket.on('storageAppAdminServiceRemoved', (serviceUuid) =>
    {
      io.in('storageAppAdminServicesList').emit('serviceRemoved', serviceUuid, storageAppStrings);
    });

    socket.on('storageAppAdminServiceCreated', (serviceUuid) =>
    {
      io.in('storageAppAdminServicesList').emit('serviceRemoved', serviceUuid, storageAppStrings);
    });
  });

  return callback();
}

/****************************************************************************************************/
