/****************************************************************************************************/

function closeFolderMenu(event)
{
  if(document.getElementById('folderContextMenu') == null) return;

  var currentTarget = event.target;

  while(currentTarget !== document.getElementById('folderContextMenu') && currentTarget !== document.body) currentTarget = currentTarget.parentNode;

  if(currentTarget !== document.getElementById('folderContextMenu'))
  {
    document.getElementById('folderContextMenu').remove();

    document.body.removeEventListener('click', closeFolderMenu);
    document.body.removeEventListener('contextmenu', closeFolderMenu);
  }
}

/****************************************************************************************************/

function openFolderMenu(event)
{
  event.preventDefault();

  if(document.getElementById('fileContextMenu')) document.getElementById('fileContextMenu').remove();

  var currentFolder = event.target;

  while(currentFolder.hasAttribute('name') == false) currentFolder = currentFolder.parentNode;

  const currentFolderUuid = currentFolder.getAttribute('name');

  if(document.getElementById('folderContextMenu')) document.getElementById('folderContextMenu').remove();

  const folderMenu        = document.createElement('div');
  const folderMenuList    = document.createElement('ul');
  const folderMenuMove    = document.createElement('li');
  const folderMenuRename  = document.createElement('li');
  const folderMenuRemove  = document.createElement('li');

  folderMenu        .setAttribute('id', 'folderContextMenu');

  folderMenu        .setAttribute('class', 'serviceElementMenu');
  folderMenuList    .setAttribute('class', 'serviceElementMenuList');
  folderMenuMove    .setAttribute('class', 'serviceElementMenuListElementDisabled');

  (currentServiceAccountRights.isAdmin || currentServiceAccountRights.renameFolders)
  ? folderMenuRename.setAttribute('class', 'serviceElementMenuListElement')
  : folderMenuRename.setAttribute('class', 'serviceElementMenuListElementDisabled');

  (currentServiceAccountRights.isAdmin || currentServiceAccountRights.removeFolders)
  ? folderMenuRemove.setAttribute('class', 'serviceElementMenuListElement')
  : folderMenuRemove.setAttribute('class', 'serviceElementMenuListElementDisabled');

  folderMenuMove    .innerText = storageStrings.serviceSection.folderContextMenu.moveFolder;
  folderMenuRename  .innerText = storageStrings.serviceSection.folderContextMenu.renameFolder;
  folderMenuRemove  .innerText = storageStrings.serviceSection.folderContextMenu.removeFolder;

  if(currentServiceAccountRights.isAdmin || currentServiceAccountRights.renameFolders)
  {
    folderMenuRename.addEventListener('click', () => renameFolderOpenPrompt(currentFolder.children[1].innerText, currentFolder.getAttribute('name')));
  }

  if(currentServiceAccountRights.isAdmin || currentServiceAccountRights.removeFolders)
  {
    folderMenuRemove.addEventListener('click', () => removeFolderOpenPrompt(currentFolder.getAttribute('name')));
  }

  folderMenuList    .appendChild(folderMenuMove);
  folderMenuList    .appendChild(folderMenuRename);
  folderMenuList    .appendChild(folderMenuRemove);
  folderMenu        .appendChild(folderMenuList);
  currentFolder     .appendChild(folderMenu);

  event             .stopPropagation();

  document.body     .addEventListener('click', closeFolderMenu);
  document.body     .addEventListener('contextmenu', closeFolderMenu);
}

/****************************************************************************************************/
