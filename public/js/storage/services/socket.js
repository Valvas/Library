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
  var elements = document.getElementById('filesBlock').children;

  for(var x = 0; x < elements.length; x++)
  {
    if(elements[x].getAttribute('name') === fileUuid) elements[x].remove();
  }
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