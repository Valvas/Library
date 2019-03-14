/****************************************************************************************************/

socket.emit('storageAppServiceJoin');

//WHEN FOLDER IS REMOVED

/****************************************************************************************************/

socket.on('serviceFileUploaded', (serviceUuid, fileData) =>
{
  if(document.getElementById('serviceStorageContainer') == null) return;
  if(document.getElementById('serviceStorageContainer').getAttribute('name') !== serviceUuid) return;

  if(fileData.parent_folder.length === 0) fileData.parent_folder = null;

  if(document.getElementById('currentServiceFolder').getAttribute('name') !== fileData.parent_folder) return;

  const currentFiles = document.getElementById('currentServiceFilesContainer').children;

  for(var x = 0; x < currentFiles.length; x++)
  {
    if(currentFiles[x].getElementsByClassName('name')[0].innerText !== fileData.name) continue;

    currentFiles[x].remove();
    break;
  }

  return appendFileToContainer({ uuid: fileData.uuid, name: fileData.name }, currentServiceAccountRights);
});

/****************************************************************************************************/

socket.on('serviceFileRemoved', (fileUuid) =>
{
  if(document.getElementById('currentServiceFilesContainer') == null) return;

  const currentFiles = document.getElementById('currentServiceFilesContainer').children;

  for(var x = 0; x < currentFiles.length; x++)
  {
    if(currentFiles[x].getAttribute('name') !== fileUuid) continue;

    currentFiles[x].remove();
    break;
  }

  return checkFileSelection();
});

/****************************************************************************************************/

socket.on('serviceFolderCreated', (serviceUuid, folderData) =>
{
  if(document.getElementById('serviceStorageContainer') == null) return;
  if(document.getElementById('serviceStorageContainer').getAttribute('name') !== serviceUuid) return;

  if(document.getElementById('currentServiceFoldersContainer') == null) return;

  if(folderData.parent_folder.length === 0) folderData.parent_folder = null;

  if(document.getElementById('currentServiceFolder').getAttribute('name') !== folderData.parent_folder) return;

  appendFolderToContainer({ uuid: folderData.uuid, name: folderData.name });
});

/****************************************************************************************************/

socket.on('serviceFolderRenamed', (folderData) =>
{
  if(document.getElementById('currentServiceFoldersContainer') == null) return;

  const currentFolders = document.getElementById('currentServiceFoldersContainer').children;

  for(var x = 0; x < currentFolders.length; x++)
  {
    if(currentFolders[x].getAttribute('name') !== folderData.uuid) continue;

    currentFolders[x].getElementsByClassName('name')[0].innerText = folderData.name;
    break;
  }
});

/****************************************************************************************************/

socket.on('serviceFolderRemoved', (serviceUuid, folderUuid) =>
{
  if(document.getElementById('serviceStorageContainer') == null) return;
  if(document.getElementById('serviceStorageContainer').getAttribute('name') !== serviceUuid) return;

  if(document.getElementById('currentServiceFolder').getAttribute('name') === folderUuid)
  {
    displayInfo(storageStrings.socketMessages.currentFolderRemoved);

    return browseFolder(null);
  }

  if(document.getElementById('currentServiceFoldersContainer') == null) return;

  const currentFolders = document.getElementById('currentServiceFoldersContainer').children;

  for(var x = 0; x < currentFolders.length; x++)
  {
    if(currentFolders[x].getAttribute('name') !== folderUuid) continue;

    currentFolders[x].remove();
    break;
  }
});

/****************************************************************************************************/
