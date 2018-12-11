/****************************************************************************************************/

var storageAppStrings = null;

var clickedCounter = 0;

var selectedFolder = null;

var currentTimeout = null;

if(document.getElementById('foldersContainer')) addEventListenersOnFolders();

function addEventListenersOnFolders()
{
  const folders = document.getElementById('foldersContainer').children;

  for(var x = 0; x < folders.length; x++)
  {
    const currentFolderUuid = folders[x].getAttribute('name');

    folders[x].addEventListener('contextmenu', openFolderMenu);
    folders[x].addEventListener('dblclick', () => { browseFolder(currentFolderUuid) });
  }
}

/****************************************************************************************************/

function manageClickEventsOnFolders(currentFolderUuid)
{
  if(currentFolderUuid !== selectedFolder)
  {
    selectedFolder = currentFolderUuid;

    clickedCounter = 1;

    clearTimeout(currentTimeout);
  }

  else
  {
    clickedCounter += 1;

    if(clickedCounter === 2)
    {
      clickedCounter = 0;

      browseFolder(currentFolderUuid);
    }
  }

  currentTimeout = setTimeout(() =>
  {
    if(clickedCounter === 1) openFolderDetail(currentFolderUuid);

    clickedCounter = 0;
  }, 250);
}

/****************************************************************************************************/

function browseFolder(folderUuid)
{
  if(document.getElementById('serviceUuid') == null) return;
  if(document.getElementById('currentFolder') == null) return;
  if(document.getElementById('currentPathLocation') == null) return;

  createBackground('browsingFolder');

  displayLoader('', (loader) =>
  {
    $.ajax(
    {
      method: 'PUT', dataType: 'json', data: { serviceUuid: document.getElementById('serviceUuid').getAttribute('name'), folderUuid: folderUuid == null ? null : folderUuid }, timeout: 10000, url: '/queries/storage/services/get-folder-content',

      error: (xhr, textStatus, errorThrown) =>
      {
        removeLoader(loader, () => {  });

        removeBackground('browsingFolder');

        xhr.responseJSON != undefined ?
        displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'browseFolderError') :
        displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'browseFolderError');
      }

    }).done((result) =>
    {
      unselectAllFiles();

      document.getElementById('currentPathLocation').innerHTML = '';

      if(result.folderPath.length === 0)
      {
        document.getElementById('currentPathLocation').innerHTML = `<div class="storageServiceMainBlockFilesPathBlockSelected">${result.storageAppStrings.services.detailPage.filesSection.rootPath}</div>`;
      }

      else
      {
        document.getElementById('currentPathLocation').innerHTML += `<div onclick="browseFolder(null)" class="storageServiceMainBlockFilesPathBlock"><div class="storageServiceMainBlockFilesPathBlockLabel">${result.storageAppStrings.services.detailPage.filesSection.rootPath}</div><div class="storageServiceMainBlockFilesPathBlockIcon"><i class="fas fa-chevron-right"></i></div></div>`;

        for(var x = 0; x < result.folderPath.length; x++)
        {
          (x + 1) === result.folderPath.length
          ? document.getElementById('currentPathLocation').innerHTML += `<div name="${result.folderPath[x].uuid}" class="storageServiceMainBlockFilesPathBlockSelected">${result.folderPath[x].name}</div>`
          : document.getElementById('currentPathLocation').innerHTML += `<div name="${result.folderPath[x].uuid}" onclick="browseFolder('${result.folderPath[x].uuid}')" class="storageServiceMainBlockFilesPathBlock"><div class="storageServiceMainBlockFilesPathBlockLabel">${result.folderPath[x].name}</div><div class="storageServiceMainBlockFilesPathBlockIcon"><i class="fas fa-chevron-right"></i></div></div>`;
        }
      }

      document.getElementById('currentFolder').removeAttribute('name');

      if(result.parentFolder != undefined) document.getElementById('currentFolder').setAttribute('name', result.parentFolder.uuid);

      document.getElementById('filesContainer').innerHTML = '';
      document.getElementById('foldersContainer').innerHTML = '';

      const folders = result.elements.folders, files = result.elements.files;

      for(var x = 0; x < folders.length; x++)
      {
        var displayClass = null;

        if(document.getElementById('selectedDisplay').getAttribute('name') === 'largeGrid') displayClass = 'serviceElementsFileLargeGrid';
        if(document.getElementById('selectedDisplay').getAttribute('name') === 'smallGrid') displayClass = 'serviceElementsFileSmallGrid';
        if(document.getElementById('selectedDisplay').getAttribute('name') === 'list') displayClass = 'serviceElementsFileList';

        document.getElementById('foldersContainer').innerHTML += `<div class="${displayClass}" name="${folders[x].uuid}"><div class="icon serviceElementsFolder"><i class="far fa-folder-open"></i></div><div class="name">${folders[x].name}</div></div>`;
      }

      for(var x = 0; x < files.length; x++)
      {
        var display = null, input = false, icon = null;

        if(document.getElementById('selectedDisplay').getAttribute('name') === 'largeGrid') display = 'serviceElementsFileLargeGrid';
        if(document.getElementById('selectedDisplay').getAttribute('name') === 'smallGrid') display = 'serviceElementsFileSmallGrid';
        if(document.getElementById('selectedDisplay').getAttribute('name') === 'list') display = 'serviceElementsFileList';

        if(result.serviceRights.downloadFiles || result.serviceRights.removeFiles || result.serviceRights.isAdmin || result.isGlobalAdmin) input = true;

        switch(files[x].name.split('.')[files[x].name.split('.').length - 1])
        {
          case 'zip': icon = `<div class="icon serviceElementsFileArchive"><i class="far fa-file-archive"></i></div>`; break;
          case 'txt': icon = `<div class="icon serviceElementsFileTxt"><i class="far fa-file-alt"></i></div>`; break;
          case 'doc': icon = `<div class="icon serviceElementsFileDoc"><i class="far fa-file-word"></i></div>`; break;
          case 'docx': icon = `<div class="icon serviceElementsFileDocx"><i class="far fa-file-word"></i></div>`; break;
          case 'ppt': icon = `<div class="icon serviceElementsFilePpt"><i class="far fa-file-powerpoint"></i></div>`; break;
          case 'pptx': icon = `<div class="icon serviceElementsFilePptx"><i class="far fa-file-powerpoint"></i></div>`; break;
          case 'xls': icon = `<div class="icon serviceElementsFileXls"><i class="far fa-file-excel"></i></div>`; break;
          case 'xlsx': icon = `<div class="icon serviceElementsFileXlsx"><i class="far fa-file-excel"></i></div>`; break;
          case 'pdf': icon = `<div class="icon serviceElementsFilePdf"><i class="far fa-file-pdf"></i></div>`; break;
          case 'png': icon = `<div class="icon serviceElementsFilePng"><i class="far fa-file-image"></i></div>`; break;
          case 'jpg': icon = `<div class="icon serviceElementsFileJpg"><i class="far fa-file-image"></i></div>`; break;
          default: icon = `<div class="icon serviceElementsFileDefault"><i class="far fa-file"></i></div>`; break;
        }

        input
        ? document.getElementById('filesContainer').innerHTML += `<div name="${files[x].uuid}" class="${display}"><input onclick="updateSelectedFiles(this)" class="checkbox" type="checkbox" />${icon}<div class="name">${files[x].name}</div></div>`
        : document.getElementById('filesContainer').innerHTML += `<div name="${files[x].uuid}" class="${display}">${icon}<div class="name">${files[x].name}</div></div>`;
      }
      
      removeLoader(loader, () => {  });

      removeBackground('browsingFolder');

      addEventListenersOnFilesForDetail();

      addEventListenersOnFolders();
    });
  });
}

/****************************************************************************************************/

function openFolderMenu(event)
{
  event.preventDefault();

  var selectedFolder = event.target;

  while(selectedFolder.hasAttribute('name') == false) selectedFolder = selectedFolder.parentNode;

  var folderMenu = document.createElement('div');
  var folderMenuBackground = document.createElement('div');

  folderMenu.setAttribute('class', 'folderMenu');
  folderMenuBackground.setAttribute('class', 'folderMenuBackground');

  folderMenu.setAttribute('id', 'folderMenu');
  folderMenuBackground.setAttribute('id', 'folderMenuBackground');

  folderMenu.setAttribute('name', selectedFolder.getAttribute('name'));

  folderMenu.innerHTML += `<div class="folderMenuLoader"><i class="fas fa-circle-notch fa-spin"></i></div>`;

  folderMenuBackground.addEventListener('click', () =>
  {
    folderMenu.remove();
    folderMenuBackground.remove();
  });

  document.getElementById('currentFolder').appendChild(folderMenuBackground);
  document.getElementById('currentFolder').appendChild(folderMenu);

  if(storageAppStrings != null) return getAccountRightsOnFolder(selectedFolder);

  getStorageAppStrings((error, strings) =>
  {
    if(error != null)
    {
      folderMenu.remove();
      folderMenuBackground.remove();

      return displayError(error.message, error.detail, 'folderMenuError');
    }

    storageAppStrings = strings;

    return getAccountRightsOnFolder(selectedFolder);
  });
}

/****************************************************************************************************/

function getAccountRightsOnFolder(selectedFolder)
{
  $.ajax(
  {
    method: 'PUT', dataType: 'json', data: { serviceUuid: document.getElementById('serviceUuid').getAttribute('name') }, timeout: 10000, url: '/queries/storage/services/get-account-rights-towards-service',

    error: (xhr, textStatus, errorThrown) =>
    {
      document.getElementById('folderMenu').remove();
      document.getElementById('folderMenuBackground').remove();

      xhr.responseJSON != undefined ?
      displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'folderMenuError') :
      displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'folderMenuError');
    }

  }).done((result) =>
  {
    return fillFolderMenu(result, selectedFolder);
  });
}

/****************************************************************************************************/

function fillFolderMenu(accountRightsOnService, selectedFolder)
{
  var closeButtonBlock  = document.createElement('div');
  var closeButton       = document.createElement('button');

  closeButtonBlock      .setAttribute('class', 'folderMenuCloseContainer');
  closeButton           .setAttribute('class', 'folderMenuClose');

  closeButton           .innerText = storageAppStrings.services.detailPage.folderMenu.close;

  closeButton           .addEventListener('click', () =>
  {
    document.getElementById('folderMenu').remove();
    document.getElementById('folderMenuBackground').remove();
  });

  const selectedFolderUuid = selectedFolder.getAttribute('name');

  const hasTheRightToRename = accountRightsOnService.isAppAdmin == true || accountRightsOnService.serviceRights.isAdmin == true || accountRightsOnService.renameFolders == true;
  const hasTheRightToRemove = accountRightsOnService.isAppAdmin == true || accountRightsOnService.serviceRights.isAdmin == true || accountRightsOnService.removeFolders == true;

  document.getElementById('folderMenu').innerHTML = `<div class="folderMenuTitle">${selectedFolder.children[1].innerText}</div>`;

  if(hasTheRightToRename)
  {
    var renameButton = document.createElement('button');

    renameButton.setAttribute('class', 'folderMenuRenameButton');
    renameButton.innerText = storageAppStrings.services.detailPage.folderMenu.rename;

    renameButton.addEventListener('click', () =>
    {
      updateFolderNameOpenPopup(storageAppStrings, selectedFolderUuid);
    });
  }

  else
  {
    document.getElementById('folderMenu').innerHTML += `<div class="folderMenuUnauthorizedMessage">${storageAppStrings.services.detailPage.folderMenu.unauthorizedToRename}</div><div class="folderMenuDisabledButton">${storageAppStrings.services.detailPage.folderMenu.rename}</div>`;
  }

  if(hasTheRightToRemove)
  {
    var removeButton = document.createElement('button');

    removeButton.setAttribute('class', 'folderMenuRemoveButton');
    removeButton.innerText = storageAppStrings.services.detailPage.folderMenu.remove;

    removeButton.addEventListener('click', () =>
    {
      removeFolderOpenConfirmationPopup(storageAppStrings, selectedFolderUuid);
    });
  }

  else
  {
    document.getElementById('folderMenu').innerHTML += `<div class="folderMenuUnauthorizedMessage">${storageAppStrings.services.detailPage.folderMenu.unauthorizedToRemove}</div><div class="folderMenuDisabledButton">${storageAppStrings.services.detailPage.folderMenu.remove}</div>`;
  }
  
  if(hasTheRightToRename) document.getElementById('folderMenu').appendChild(renameButton);
  if(hasTheRightToRemove) document.getElementById('folderMenu').appendChild(removeButton);

  closeButtonBlock.appendChild(closeButton);

  document.getElementById('folderMenu').appendChild(closeButtonBlock);
}

/****************************************************************************************************/
