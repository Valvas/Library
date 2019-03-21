/****************************************************************************************************/

function closeFileMenu(event)
{
  if(document.getElementById('fileContextMenu') == null) return;

  var currentTarget = event.target;

  while(currentTarget !== document.getElementById('fileContextMenu') && currentTarget !== document.body) currentTarget = currentTarget.parentNode;

  if(currentTarget !== document.getElementById('fileContextMenu'))
  {
    document.getElementById('fileContextMenu').remove();

    document.body.removeEventListener('click', closeFileMenu);
    document.body.removeEventListener('contextmenu', closeFileMenu);
  }
}

/****************************************************************************************************/

function openFileMenu(event)
{
  event.preventDefault();

  if(document.getElementById('folderContextMenu')) document.getElementById('folderContextMenu').remove();

  var currentFile = event.target;

  while(currentFile.hasAttribute('name') == false) currentFile = currentFile.parentNode;

  const currentFileUuid = currentFile.getAttribute('name');

  if(document.getElementById('fileContextMenu')) document.getElementById('fileContextMenu').remove();

  const fileMenu          = document.createElement('div');
  const fileMenuList      = document.createElement('ul');
  const fileMenuDetail    = document.createElement('li');
  const fileMenuMove      = document.createElement('li');
  const fileMenuDownload  = document.createElement('li');
  const fileMenuRemove    = document.createElement('li');

  fileMenu          .setAttribute('id', 'fileContextMenu');

  fileMenu          .setAttribute('class', 'serviceElementMenu');
  fileMenuList      .setAttribute('class', 'serviceElementMenuList');
  fileMenuDetail    .setAttribute('class', 'serviceElementMenuListElement');

  (currentServiceAccountRights.isAdmin || currentServiceAccountRights.moveFiles)
  ? fileMenuMove.setAttribute('class', 'serviceElementMenuListElement')
  : fileMenuMove.setAttribute('class', 'serviceElementMenuListElementDisabled');

  (currentServiceAccountRights.isAdmin || currentServiceAccountRights.downloadFiles)
  ? fileMenuDownload.setAttribute('class', 'serviceElementMenuListElement')
  : fileMenuDownload.setAttribute('class', 'serviceElementMenuListElementDisabled');

  (currentServiceAccountRights.isAdmin || currentServiceAccountRights.removeFiles)
  ? fileMenuRemove.setAttribute('class', 'serviceElementMenuListElement')
  : fileMenuRemove.setAttribute('class', 'serviceElementMenuListElementDisabled');

  fileMenuMove      .innerText = storageStrings.serviceSection.fileContextMenu.moveFile;
  fileMenuDetail    .innerText = storageStrings.serviceSection.fileContextMenu.openDetail;
  fileMenuDownload  .innerText = storageStrings.serviceSection.fileContextMenu.downloadFile;
  fileMenuRemove    .innerText = storageStrings.serviceSection.fileContextMenu.removeFile;

  fileMenuDetail.addEventListener('click', () => openFileDetail(currentFile.getAttribute('name')));

  if(currentServiceAccountRights.isAdmin || currentServiceAccountRights.moveFiles)
  {
    fileMenuMove.addEventListener('click', () => moveElementRetrieveStructure(currentFile.getAttribute('name')));
  }

  if(currentServiceAccountRights.isAdmin || currentServiceAccountRights.downloadFiles)
  {
    fileMenuDownload.addEventListener('click', () => downloadSingleFile(currentFile.getAttribute('name')));
  }

  if(currentServiceAccountRights.isAdmin || currentServiceAccountRights.removeFiles)
  {
    fileMenuRemove.addEventListener('click', () => removeSingleFile(currentFile.getAttribute('name'), currentFile.getElementsByClassName('name')[0].innerText));
  }

  fileMenuList      .appendChild(fileMenuDetail);
  fileMenuList      .appendChild(fileMenuMove);
  fileMenuList      .appendChild(fileMenuDownload);
  fileMenuList      .appendChild(fileMenuRemove);
  fileMenu          .appendChild(fileMenuList);
  currentFile       .appendChild(fileMenu);

  event             .stopPropagation();

  document.body     .addEventListener('click', closeFileMenu);
  document.body     .addEventListener('contextmenu', closeFileMenu);
}

/****************************************************************************************************/
