/****************************************************************************************************/

function browseFolder(folderUuid)
{
  if(document.getElementById('currentServiceFolder') == null) return;

  if(document.getElementById('searchSection')) document.getElementById('searchSection').remove();
  if(document.getElementById('currentServiceContent')) document.getElementById('currentServiceContent').removeAttribute('style');

  if(document.getElementById('currentServiceEmptyFolder')) document.getElementById('currentServiceEmptyFolder').removeAttribute('style');

  document.getElementById('currentServiceFolder').innerHTML = `<div class="serviceFolderContentLoader"><div class="serviceFolderContentLoaderSpinner"></div></div>`;

  $.ajax(
  {
    method: 'PUT', dataType: 'json', data: { serviceUuid: document.getElementById('serviceStorageContainer').getAttribute('name'), folderUuid: folderUuid == null ? null : folderUuid }, timeout: 10000, url: '/queries/storage/services/get-folder-content',

    error: (xhr, textStatus, errorThrown) =>
    {
      document.getElementById('currentServiceFolder').innerHTML = '';

      xhr.responseJSON != undefined ?
      displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'browseFolderError') :
      displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'browseFolderError');
    }

  }).done((result) =>
  {
    const currentFolderData = result;

    folderUuid == null
    ? document.getElementById('currentServiceFolder').removeAttribute('name')
    : document.getElementById('currentServiceFolder').setAttribute('name', folderUuid);

    currentFolderData.elements.files.length === 0 && currentFolderData.elements.folders.length === 0
    ? document.getElementById('currentServiceEmptyFolder').style.display = 'block'
    : document.getElementById('currentServiceEmptyFolder').removeAttribute('style');

    document.getElementById('serviceStorageUnselectFiles').setAttribute('class', 'serviceStorageContainerToolsActionsDisabledButton');
    document.getElementById('serviceStorageUnselectFiles').removeEventListener('click', unselectAllFiles);

    if(document.getElementById('serviceStorageDownloadFiles'))
    {
      document.getElementById('serviceStorageDownloadFiles').setAttribute('class', 'serviceStorageContainerToolsActionsDisabledButton');
      document.getElementById('serviceStorageDownloadFiles').removeEventListener('click', downloadFiles);
    }

    if(document.getElementById('serviceStorageRemoveFiles'))
    {
      document.getElementById('serviceStorageRemoveFiles').setAttribute('class', 'serviceStorageContainerToolsActionsDisabledButton');
      document.getElementById('serviceStorageRemoveFiles').removeEventListener('click', removeFilesOpenPrompt);
    }

    document.getElementById('serviceStorageContainerToolsCounterValue').innerText = '0';

    document.getElementById('currentServiceFolder').innerHTML = '';

    if(folderUuid != null) document.getElementById('currentServiceFolder').setAttribute('name', folderUuid);

    var filesContainer    = document.createElement('div');
    var foldersContainer  = document.createElement('div');

    filesContainer        .setAttribute('class', 'serviceStorageContainerElements');
    foldersContainer      .setAttribute('class', 'serviceStorageContainerElements');

    filesContainer        .setAttribute('id', 'currentServiceFilesContainer');
    foldersContainer      .setAttribute('id', 'currentServiceFoldersContainer');

    document.getElementById('currentServiceFolder').style.display = 'none';

    document.getElementById('currentServiceFolder').appendChild(foldersContainer);
    document.getElementById('currentServiceFolder').appendChild(filesContainer);

    const browseFolders = (index) =>
    {
      if(currentFolderData.elements.folders[index] == undefined) return browseFiles(0);

      appendFolderToContainer(currentFolderData.elements.folders[index]);

      browseFolders(index + 1);
    }

    const browseFiles = (index) =>
    {
      if(currentFolderData.elements.files[index] != undefined)
      {
        appendFileToContainer(currentFolderData.elements.files[index], currentFolderData.serviceRights);

        return browseFiles(index + 1);
      }

      browseFolderCreatePath(currentFolderData.folderPath, () =>
      {
        $(document.getElementById('currentServiceFolder')).fadeIn(250);
      });
    }

    browseFolders(0);
  });
}

/****************************************************************************************************/

function browseFolderCreatePath(pathData, callback)
{
  if(document.getElementById('serviceStorageContainerPath') == null) return callback();

  document.getElementById('serviceStorageContainerPath').innerHTML = '';

  const pathRoot  = document.createElement('span');

  pathRoot        .setAttribute('class', 'serviceStorageContainerPathElement');

  pathRoot        .innerText = storageStrings.serviceSection.pathRoot;

  pathRoot        .setAttribute('onclick', `browseFolder(null)`);

  document.getElementById('serviceStorageContainerPath').appendChild(pathRoot);

  for(var x = 0; x < pathData.length; x++)
  {
    const currentFolderData = pathData[x];

    document.getElementById('serviceStorageContainerPath').innerHTML += `<span class="serviceStorageContainerPathSeparator">/</span>`;

    const currentFolder   = document.createElement('span');
    currentFolder         .setAttribute('class', 'serviceStorageContainerPathElement');
    currentFolder         .innerText = currentFolderData.name;

    currentFolder         .setAttribute('onclick', `browseFolder("${currentFolderData.uuid}")`);

    document.getElementById('serviceStorageContainerPath').appendChild(currentFolder);
  }

  return callback();
}

/****************************************************************************************************/

function appendFolderToContainer(folderData)
{
  document.getElementById('currentServiceEmptyFolder').removeAttribute('style');

  var folder        = document.createElement('div');
  var folderIcon    = document.createElement('div');
  var folderName    = document.createElement('div');

  var currentDisplay = null;

  if(document.getElementById('serviceStorageSelectedDisplay').options[document.getElementById('serviceStorageSelectedDisplay').selectedIndex].value === 'large') currentDisplay = 'serviceFolderLarge';
  if(document.getElementById('serviceStorageSelectedDisplay').options[document.getElementById('serviceStorageSelectedDisplay').selectedIndex].value === 'small') currentDisplay = 'serviceFolderSmall';
  if(document.getElementById('serviceStorageSelectedDisplay').options[document.getElementById('serviceStorageSelectedDisplay').selectedIndex].value === 'list') currentDisplay = 'serviceFolderList';

  folder            .setAttribute('class', currentDisplay);
  folderIcon        .setAttribute('class', `icon`);
  folderName        .setAttribute('class', `name`);

  folder            .setAttribute('name', folderData.uuid);

  folderIcon        .innerHTML = `<i class="fas fa-folder-open"></i>`;
  folderName        .innerText = folderData.name;

  folder            .addEventListener('dblclick', () =>
  {
    browseFolder(folderData.uuid);
  });

  folder            .addEventListener('contextmenu', openFolderMenu);

  folder            .appendChild(folderIcon);
  folder            .appendChild(folderName);

  const currentFolders = document.getElementById('currentServiceFoldersContainer').children;

  var indexWhereToInsert = 0;

  for(var x = 0; x < currentFolders.length; x++)
  {
    if(currentFolders[x].getElementsByClassName('name')[0].innerText.localeCompare(folderData.name) > 0) break;

    indexWhereToInsert += 1;
  }

  document.getElementById('currentServiceFoldersContainer').insertBefore(folder, document.getElementById('currentServiceFoldersContainer').children[indexWhereToInsert]);
}

/****************************************************************************************************/

function appendFileToContainer(fileData, serviceRights)
{
  document.getElementById('currentServiceEmptyFolder').removeAttribute('style');

  const fileName      = fileData.name.split('.')[0]
  const fileExtension = fileData.name.split('.').length > 1 ? fileData.name.split('.')[1] : null;

  var display = null, icon = null;

  if(document.getElementById('serviceStorageSelectedDisplay').options[document.getElementById('serviceStorageSelectedDisplay').selectedIndex].value === 'large') display = 'serviceFileLarge';
  if(document.getElementById('serviceStorageSelectedDisplay').options[document.getElementById('serviceStorageSelectedDisplay').selectedIndex].value === 'small') display = 'serviceFileSmall';
  if(document.getElementById('serviceStorageSelectedDisplay').options[document.getElementById('serviceStorageSelectedDisplay').selectedIndex].value === 'list') display = 'serviceFileList';

  switch(fileExtension)
  {
    case 'zip':   icon = `<div class="icon serviceFileArchive"><i class="far fa-file-archive"></i></div>`;  break;
    case 'txt':   icon = `<div class="icon serviceFileTxt"><i class="far fa-file-alt"></i></div>`;          break;
    case 'doc':   icon = `<div class="icon serviceFileDoc"><i class="far fa-file-word"></i></div>`;         break;
    case 'docx':  icon = `<div class="icon serviceFileDocx"><i class="far fa-file-word"></i></div>`;        break;
    case 'ppt':   icon = `<div class="icon serviceFilePpt"><i class="far fa-file-powerpoint"></i></div>`;   break;
    case 'pptx':  icon = `<div class="icon serviceFilePptx"><i class="far fa-file-powerpoint"></i></div>`;  break;
    case 'xls':   icon = `<div class="icon serviceFileXls"><i class="far fa-file-excel"></i></div>`;        break;
    case 'xlsx':  icon = `<div class="icon serviceFileXlsx"><i class="far fa-file-excel"></i></div>`;       break;
    case 'pdf':   icon = `<div class="icon serviceFilePdf"><i class="far fa-file-pdf"></i></div>`;          break;
    case 'png':   icon = `<div class="icon serviceFilePng"><i class="far fa-file-image"></i></div>`;        break;
    case 'jpg':   icon = `<div class="icon serviceFileJpg"><i class="far fa-file-image"></i></div>`;        break;
    default:      icon = `<div class="icon serviceFileDefault"><i class="far fa-file"></i></div>`;          break;
  }

  const file      = document.createElement('div');
  const checkbox  = document.createElement('input');

  checkbox        .setAttribute('type', 'checkbox');

  file            .setAttribute('name', fileData.uuid);
  file            .setAttribute('class', display);

  file            .addEventListener('contextmenu', openFileMenu);

  if(serviceRights.isAdmin || serviceRights.downloadFiles || serviceRights.removeFiles)
  {
    file          .addEventListener('click', fileSelected);

    file          .appendChild(checkbox);
  }

  file            .innerHTML += icon;
  file            .innerHTML += `<div class="name">${fileData.name}</div>`;

  const currentFiles = document.getElementById('currentServiceFilesContainer').children;

  var indexWhereToInsert = 0;

  for(var x = 0; x < currentFiles.length; x++)
  {
    if(currentFiles[x].getElementsByClassName('name')[0].innerText.localeCompare(fileData.name) > 0) break;

    indexWhereToInsert += 1;
  }

  document.getElementById('currentServiceFilesContainer').insertBefore(file, document.getElementById('currentServiceFilesContainer').children[indexWhereToInsert]);
}

/****************************************************************************************************/

function appendElementToSearchContainer(elementData, serviceRights, callback)
{
  const elementName = elementData.name.split('.').slice(0, (elementData.name.split('.').length - 1)).join();
  const elementExt  = elementData.name.split('.')[elementData.name.split('.').length - 1];

  const currentResultContainers = document.getElementById('searchSectionResult').children;

  var block = elementData.parentFolder == null ? currentResultContainers[0] : null;

  /********************************************************************************/

  for(var x = 0; x < currentResultContainers.length; x++)
  {
    if(elementData.parentFolder == null) break;

    if(currentResultContainers[x].getAttribute('name') !== elementData.parentFolder.uuid) continue;

    block = currentResultContainers[x];
  }

  /********************************************************************************/

  if(block == null)
  {
    block = document.createElement('div');

    if(elementData.parentFolder != null) block.setAttribute('name', elementData.parentFolder.uuid);

    block.setAttribute('class', 'serviceSearchSectionContainer');

    block.innerHTML += `<div class="serviceSearchSectionContainerPath">${storageStrings.serviceSection.pathRoot} / ${elementData.parentFolder.path.join(' / ')}</div>`;
    block.innerHTML += `<div class="serviceSearchSectionContainerElements"></div>`;
    block.innerHTML += `<div class="serviceSearchSectionContainerElements"></div>`;

    document.getElementById('searchSectionResult').appendChild(block);
  }

  /********************************************************************************/

  if(elementData.isDirectory)
  {
    var currentDisplay = null;

    if(document.getElementById('serviceStorageSelectedDisplay').options[document.getElementById('serviceStorageSelectedDisplay').selectedIndex].value === 'large') currentDisplay = 'serviceFolderLarge';
    if(document.getElementById('serviceStorageSelectedDisplay').options[document.getElementById('serviceStorageSelectedDisplay').selectedIndex].value === 'small') currentDisplay = 'serviceFolderSmall';
    if(document.getElementById('serviceStorageSelectedDisplay').options[document.getElementById('serviceStorageSelectedDisplay').selectedIndex].value === 'list') currentDisplay = 'serviceFolderList';

    /********************************************************************************/

    const folder      = document.createElement('div');
    const folderIcon  = document.createElement('div');
    const folderName  = document.createElement('div');

    folder            .setAttribute('class', currentDisplay);
    folderIcon        .setAttribute('class', `icon`);
    folderName        .setAttribute('class', `name`);

    folder            .setAttribute('name', elementData.uuid);

    folderIcon        .innerHTML = `<i class="fas fa-folder-open"></i>`;
    folderName        .innerText = elementData.name;

    folder            .addEventListener('dblclick', () =>
    {
      browseFolder(elementData.uuid);
    });

    folder            .addEventListener('contextmenu', openFolderMenu);

    folder            .appendChild(folderIcon);
    folder            .appendChild(folderName);

    /********************************************************************************/

    const currentFolders = block.children[1].children;

    var indexWhereToInsert = 0;

    for(var x = 0; x < currentFolders.length; x++)
    {
      if(currentFolders[x].getElementsByClassName('name')[0].innerText.localeCompare(elementData.name) > 0) break;

      indexWhereToInsert += 1;
    }

    block.children[1].insertBefore(folder, block.children[1].children[indexWhereToInsert]);

    return callback();
  }

  /********************************************************************************/

  else
  {
    var display = null, icon = null;

    if(document.getElementById('serviceStorageSelectedDisplay').options[document.getElementById('serviceStorageSelectedDisplay').selectedIndex].value === 'large') display = 'serviceFileLarge';
    if(document.getElementById('serviceStorageSelectedDisplay').options[document.getElementById('serviceStorageSelectedDisplay').selectedIndex].value === 'small') display = 'serviceFileSmall';
    if(document.getElementById('serviceStorageSelectedDisplay').options[document.getElementById('serviceStorageSelectedDisplay').selectedIndex].value === 'list') display = 'serviceFileList';

    /********************************************************************************/

    switch(elementExt)
    {
      case 'zip':   icon = `<div class="icon serviceFileArchive"><i class="far fa-file-archive"></i></div>`;  break;
      case 'txt':   icon = `<div class="icon serviceFileTxt"><i class="far fa-file-alt"></i></div>`;          break;
      case 'doc':   icon = `<div class="icon serviceFileDoc"><i class="far fa-file-word"></i></div>`;         break;
      case 'docx':  icon = `<div class="icon serviceFileDocx"><i class="far fa-file-word"></i></div>`;        break;
      case 'ppt':   icon = `<div class="icon serviceFilePpt"><i class="far fa-file-powerpoint"></i></div>`;   break;
      case 'pptx':  icon = `<div class="icon serviceFilePptx"><i class="far fa-file-powerpoint"></i></div>`;  break;
      case 'xls':   icon = `<div class="icon serviceFileXls"><i class="far fa-file-excel"></i></div>`;        break;
      case 'xlsx':  icon = `<div class="icon serviceFileXlsx"><i class="far fa-file-excel"></i></div>`;       break;
      case 'pdf':   icon = `<div class="icon serviceFilePdf"><i class="far fa-file-pdf"></i></div>`;          break;
      case 'png':   icon = `<div class="icon serviceFilePng"><i class="far fa-file-image"></i></div>`;        break;
      case 'jpg':   icon = `<div class="icon serviceFileJpg"><i class="far fa-file-image"></i></div>`;        break;
      default:      icon = `<div class="icon serviceFileDefault"><i class="far fa-file"></i></div>`;          break;
    }

    /********************************************************************************/

    const file      = document.createElement('div');
    const checkbox  = document.createElement('input');

    file            .setAttribute('name', elementData.uuid);
    file            .setAttribute('class', display);

    file            .innerHTML += icon;
    file            .innerHTML += `<div class="name">${elementData.name}</div>`;

    file            .addEventListener('contextmenu', openFileMenu);

    const parentFolderUuid = elementData.parentFolder == null ? null : elementData.parentFolder.uuid;

    file            .addEventListener('dblclick', () =>
    {
      browseFolder(parentFolderUuid);
    });

    /********************************************************************************/

    const currentFiles = block.children[2].children;

    var indexWhereToInsert = 0;

    for(var x = 0; x < currentFiles.length; x++)
    {
      if(currentFiles[x].getElementsByClassName('name')[0].innerText.localeCompare(elementData.name) > 0) break;

      indexWhereToInsert += 1;
    }

    block.children[2].insertBefore(file, block.children[2].children[indexWhereToInsert]);

    return callback();
  }
}

/****************************************************************************************************/
