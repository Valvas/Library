/****************************************************************************************************/

var socket = io();

/****************************************************************************************************/

socket.on('connect', () =>
{
  socket.emit('storageAppServicesDetailJoin', document.getElementById('mainBlock').getAttribute('name'));
});

/****************************************************************************************************/

socket.on('fileUploaded', (file, folderUuid) =>
{
  if(document.getElementById('currentPath').children[document.getElementById('currentPath').children.length - 1].getAttribute('name') === folderUuid)
  {
    addFile(file);
  }
});

/****************************************************************************************************/

socket.on('fileRemoved', (fileUuid) =>
{
  if(document.getElementById(fileUuid)) document.getElementById(fileUuid).remove();
});

/****************************************************************************************************/

socket.on('folderCreated', (folderData, parentFolderUuid) =>
{
  if(document.getElementById('currentPath').children[document.getElementById('currentPath').children.length - 1].getAttribute('name') === parentFolderUuid)
  {
    addFolder(folderData);
  }
});

/****************************************************************************************************/

socket.on('folderNameUpdated', (folderUuid, newFolderName) =>
{
  if(document.getElementById(folderUuid))
  {
    document.getElementById(folderUuid).children[1].innerText = newFolderName;
  }

  if(document.getElementById('elementDetailBlock') && document.getElementById('elementDetailBlock').getAttribute('name') === folderUuid)
  {
    document.getElementById('elementDetailBlock').children[3].innerText = newFolderName;
  }
});

/****************************************************************************************************/