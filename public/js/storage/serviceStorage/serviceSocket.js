/****************************************************************************************************/

socket.emit('storageAppServiceJoin');

/****************************************************************************************************/
/* SOCKET CALLED WHEN FILE IS UPLOADED */
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
/* SOCKET CALLED WHEN FILE IS REMOVED */
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
/* SOCKET CALLED WHEN FOLDER IS CREATED */
/****************************************************************************************************/

socket.on('serviceFolderCreated', (serviceUuid, folderData) =>
{
  if(document.getElementById('serviceStorageContainer') == null) return;
  if(document.getElementById('serviceStorageContainer').getAttribute('name') !== serviceUuid) return;

  if(folderData.parent_folder.length === 0) folderData.parent_folder = null;

  if(document.getElementById('moveElementModal'))
  {
    const foldersContainer = document.getElementById('moveElementModal').getElementsByClassName('serviceMoveFileModalContentFolders')[0];

    if(foldersContainer.getAttribute('name') === folderData.parent_folder)
    {
      moveElementAppendFolderToContainer(folderData);
    }
  }

  if(document.getElementById('currentServiceFoldersContainer') == null) return;

  if(document.getElementById('currentServiceFolder').getAttribute('name') !== folderData.parent_folder) return;

  appendFolderToContainer({ uuid: folderData.uuid, name: folderData.name });
});

/****************************************************************************************************/
/* SOCKET CALLED WHEN FOLDER IS RENAMED */
/****************************************************************************************************/

socket.on('serviceFolderRenamed', (folderData) =>
{
  if(document.getElementById('currentServiceFoldersContainer') == null) return;

  /********************************************************************************/

  if(document.getElementById('moveElementModal'))
  {
    const pathElements = document.getElementById('moveElementModal').getElementsByClassName('serviceMoveFileModalContentPath')[0].children;
    const containerElements = document.getElementById('moveElementModal').getElementsByClassName('serviceMoveFileModalContentFolders')[0].children;

    for(var x = 0; x < pathElements.length; x++)
    {
      if(pathElements[x].getAttribute('name') !== folderData.uuid) continue;

      pathElements[x].innerText = folderData.name;
    }

    for(var x = 0; x < containerElements.length; x++)
    {
      if(containerElements[x].getAttribute('name') !== folderData.uuid) continue;

      containerElements[x].children[1].innerText = folderData.name;
    }
  }

  /********************************************************************************/

  const currentFolders = document.getElementById('currentServiceFoldersContainer').children;

  for(var x = 0; x < currentFolders.length; x++)
  {
    if(currentFolders[x].getAttribute('name') !== folderData.uuid) continue;

    currentFolders[x].getElementsByClassName('name')[0].innerText = folderData.name;
    break;
  }
});

/****************************************************************************************************/
/* SOCKET CALLED WHEN FOLDER IS REMOVED */
/****************************************************************************************************/

socket.on('serviceFolderRemoved', (serviceUuid, folderUuid) =>
{
  if(document.getElementById('serviceStorageContainer') == null) return;
  if(document.getElementById('serviceStorageContainer').getAttribute('name') !== serviceUuid) return;

  /********************************************************************************/

  if(document.getElementById('moveElementModal'))
  {
    const foldersContainer = document.getElementById('moveElementModal').getElementsByClassName('serviceMoveFileModalContentFolders')[0];

    if(foldersContainer.getAttribute('name') === folderUuid)
    {
      displayInfo(storageStrings.socketMessages.currentFolderRemoved, null, 'currentFolderRemoved');
      moveElementBrowseFolder(null);
    }

    else
    {
      const currentFolders = foldersContainer.children;

      for(var x = 0; x < currentFolders.length; x++)
      {
        if(currentFolders[x].getAttribute('name') !== folderUuid) continue;

        currentFolders[x].remove();
      }
    }
  }

  /********************************************************************************/

  if(document.getElementById('currentServiceFolder').getAttribute('name') === folderUuid)
  {
    displayInfo(storageStrings.socketMessages.currentFolderRemoved);

    return browseFolder(null);
  }

  /********************************************************************************/

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
/* SOCKET CALLED WHEN ELEMENT IS MOVED */
/****************************************************************************************************/

socket.on('serviceElementMoved', (elementData, elementPath, serviceUuid) =>
{
  if(document.getElementById('searchSectionResult'))
  {
    if(document.getElementById('serviceSearchBar') && document.getElementById('serviceSearchBar').value.length > 0)
    {
      if(document.getElementById('serviceSearchBar').value.trim().toLowerCase().includes(elementData.name.toLowerCase()) || elementData.name.toLowerCase().includes(document.getElementById('serviceSearchBar').value.trim().toLowerCase()))
      {
        const searchBlocks = document.getElementById('searchSectionResult').children;

        for(var x = 0; x < searchBlocks.length; x++)
        {
          if(elementData.isDirectory)
          {
            const currentFolders = searchBlocks[x].getElementsByClassName('serviceSearchSectionContainerElements')[0].children;

            for(var z = 0; z < currentFolders.length; z++)
            {
              if(currentFolders[z].getAttribute('name') === elementData.uuid)
              {
                currentFolders[z].remove();
                break;
              }
            }
          }

          else
          {
            const currentFiles = searchBlocks[x].getElementsByClassName('serviceSearchSectionContainerElements')[1].children;

            for(var z = 0; z < currentFiles.length; z++)
            {
              if(currentFiles[z].getAttribute('name') === elementData.uuid)
              {
                currentFiles[z].remove();
                break;
              }
            }
          }
        }

        appendElementToSearchContainer(elementData, currentServiceAccountRights, () => {  });
      }
    }
  }

  /********************************************************************************/

  if(document.getElementById('serviceStorageContainer') == null) return;
  if(document.getElementById('serviceStorageContainer').getAttribute('name') !== serviceUuid) return;

  /********************************************************************************/

  if(elementData.isDirectory)
  {

  }

  /********************************************************************************/

  else
  {
    if(elementData.parentFolder == null && document.getElementById('currentServiceFolder').getAttribute('name') == null)
    {
      appendFileToContainer(elementData, currentServiceAccountRights);
    }

    else if(document.getElementById('currentServiceFolder').getAttribute('name') === elementData.parentFolder.uuid)
    {
      appendFileToContainer(elementData, currentServiceAccountRights);
    }

    else
    {
      const currentFiles = document.getElementById('currentServiceFilesContainer').children;

      for(var x = 0; x < currentFiles.length; x++)
      {
        if(currentFiles[x].getAttribute('name') === elementData.uuid)
        {
          displayInfo(storageStrings.socketMessages.fileMoved.replace('$[1]', elementData.name), null, 'serviceFileMoved');

          currentFiles[x].remove();
        }
      }
    }
  }
});

/****************************************************************************************************/
