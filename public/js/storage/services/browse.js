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

      console.log(result);

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
          ? document.getElementById('currentPathLocation').innerHTML += `<div class="storageServiceMainBlockFilesPathBlockSelected">${result.folderPath[x].name}</div>`
          : document.getElementById('currentPathLocation').innerHTML += `<div onclick="browseFolder('${result.folderPath[x].uuid}')" class="storageServiceMainBlockFilesPathBlock"><div class="storageServiceMainBlockFilesPathBlockLabel">${result.folderPath[x].name}</div><div class="storageServiceMainBlockFilesPathBlockIcon"><i class="fas fa-chevron-right"></i></div></div>`;
        }
      }

      document.getElementById('currentFolder').removeAttribute('name');

      if(result.parentFolder != undefined) document.getElementById('currentFolder').setAttribute('name', result.parentFolder.uuid);

      document.getElementById('currentFolder').innerHTML = '';

      const folders = result.elements.folders, files = result.elements.files;

      for(var x = 0; x < folders.length; x++)
      {
        var displayClass = null;

        if(document.getElementById('selectedDisplay').getAttribute('name') === 'largeGrid') displayClass = 'serviceElementsFileLargeGrid';
        if(document.getElementById('selectedDisplay').getAttribute('name') === 'smallGrid') displayClass = 'serviceElementsFileSmallGrid';
        if(document.getElementById('selectedDisplay').getAttribute('name') === 'list') displayClass = 'serviceElementsFileList';

        document.getElementById('currentFolder').innerHTML += `<div ondblclick="browseFolder('${folders[x].uuid}')" class="${displayClass}" name="${folders[x].uuid}"><div class="icon serviceElementsFolder"><i class="far fa-folder-open"></i></div><div class="name">${folders[x].name}</div></div>`;
      }

      for(var x = 0; x < files.length; x++)
      {
        var display = null, input = false, icon = null;

        if(document.getElementById('selectedDisplay').getAttribute('name') === 'largeGrid') display = 'serviceElementsFileLargeGrid';
        if(document.getElementById('selectedDisplay').getAttribute('name') === 'smallGrid') display = 'serviceElementsFileSmallGrid';
        if(document.getElementById('selectedDisplay').getAttribute('name') === 'list') display = 'serviceElementsFileList';

        if(result.serviceRights.downloadFiles <= result.accountRightsLevel || result.serviceRights.removeFiles <= result.accountRightsLevel) input = true;

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
        ? document.getElementById('currentFolder').innerHTML += `<div class="${display}"><input onclick="updateSelectedFiles(this)" class="checkbox" type="checkbox" />${icon}<div class="name">${files[x].name}</div></div>`
        : document.getElementById('currentFolder').innerHTML += `<div class="${display}">${icon}<div class="name">${files[x].name}</div></div>`;
      }
      
      removeLoader(loader, () => {  });

      removeBackground('browsingFolder');
    });
  });
}

/****************************************************************************************************/

var clickCount = 0;

function checkSingleOrDoubleClick(folderUuid)
{
  var clickedFolderIsAlreadyOpen = false;

  if(document.getElementById('elementDetailBlock')) document.getElementById(document.getElementById('elementDetailBlock').getAttribute('name')).removeAttribute('style');

  if(document.getElementById('elementDetailBlock') && folderUuid === document.getElementById('elementDetailBlock').getAttribute('name'))
  {
    clickedFolderIsAlreadyOpen = true;
  }

  if(clickedFolderIsAlreadyOpen == false) document.getElementById(folderUuid).style.backgroundColor = '#E5E5FF';

  closeDetailBlock();

  clickCount += 1;

  if(clickCount === 1)
  {
    singleClickTimer = setTimeout(() =>
    {
      clickCount = 0;

      if(clickedFolderIsAlreadyOpen == false) openFolderDetail(folderUuid);

    }, 300);

  } 
  
  else if(clickCount === 2) 
  {
    clearTimeout(singleClickTimer);

    clickCount = 0;
    
    browseToFolder(folderUuid);
  }
}

/****************************************************************************************************/

function browseToFolder(folderUuid)
{
  if(document.getElementById('loadingFolderSpinner') == null)
  {
    var spinner = document.createElement('div');

    spinner.setAttribute('id', 'loadingFolderSpinner');
    spinner.setAttribute('class', 'loadingFolderSpinner');

    spinner.innerHTML = '<i class="fas fa-3x fa-circle-notch fa-spin"></i>';

    document.getElementById('filesBlock').style.display = 'none';

    document.getElementById('mainBlock').children[2].appendChild(spinner);

    $.ajax(
    {
      method: 'PUT',
      dataType: 'json',
      data: { folderUuid: folderUuid },
      timeout: 5000,
      url: '/queries/storage/services/get-folder-content',

      error: (xhr, textStatus, errorThrown) =>
      {
        spinner.remove();

        if(document.getElementById('filesBlock')) document.getElementById('filesBlock').removeAttribute('style');

        xhr.responseJSON != undefined ?
        displayErrorMessage(xhr.responseJSON.message, xhr.responseJSON.detail) :
        displayErrorMessage('Une erreur est survenue, veuillez réessayer plus tard', null);
      }

    }).done((json) =>
    {
      document.getElementById('actions').children[0].innerText = document.getElementById('actions').children[0].innerText.split(' : ')[0] + ' : 0';

      document.getElementById('filesBlock').setAttribute('name', folderUuid);

      var currentPathElements = document.getElementById('currentPath').children;

      // Check if folder selected is a child of the current folder

      var isAChild = true;

      for(var x = 0; x < currentPathElements.length; x++)
      {
        if(currentPathElements[x].getAttribute('name') === folderUuid) isAChild = false;
      }

      // Child folder must be added to the path

      if(isAChild)
      {
        var currentFolder = document.createElement('div');

        folderUuid === ''
        ? currentFolder.innerText = '/'
        : currentFolder.innerText = document.getElementById(folderUuid).children[1].innerText;

        currentFolder.setAttribute('class', 'currentPathBlockSelected');
        currentFolder.setAttribute('name', json.result.parentFolder);

        document.getElementById('currentPath').appendChild(currentFolder);
      }

      // Folder selected is a parent in the path, then all its children must be removed from path

      else
      {
        for(var x = (currentPathElements.length - 1); x >= 0; x--)
        {
          if(currentPathElements[x].getAttribute('name') === folderUuid) break;

          currentPathElements[x].remove();
        }
      }

      document.getElementById('filesBlock').innerHTML = '';
      document.getElementById('filesBlock').removeAttribute('style');

      // Apply the event click on parents in path

      for(var x = 0; x < currentPathElements.length; x++)
      {
        if((x + 1) != currentPathElements.length)
        {
          currentPathElements[x].setAttribute('class', 'currentPathBlock');
          currentPathElements[x].setAttribute('onclick', `browseToFolder("${currentPathElements[x].getAttribute('name')}")`);
        }

        else
        {
          currentPathElements[x].removeAttribute('onclick');
          currentPathElements[x].setAttribute('class', 'currentPathBlockSelected');
        }
      }

      spinner.remove();

      // Add each folder from current folder

      for(var folder in json.result.folders)
      {
        addFolder(json.result.folders[folder]);
      }

      // Add a root folder only if we are not already at the first root

      if(folderUuid !== '')
      {
        addReturnFolder(folderUuid);
      }

      // Add each file from current folder

      for(var file in json.result.files)
      {
        addFile(json.result.files[file]);
      }

      applyDetailClickEventOnFiles();
    });
  }
}

/****************************************************************************************************/

function browseToParentFolder(currentFolderUuid)
{
  if(document.getElementById('loadingFolderSpinner') == null)
  {
    var spinner = document.createElement('div');

    spinner.setAttribute('id', 'loadingFolderSpinner');
    spinner.setAttribute('class', 'loadingFolderSpinner');

    spinner.innerHTML = '<i class="fas fa-3x fa-circle-notch fa-spin"></i>';

    if(document.getElementById('filesBlock')) document.getElementById('filesBlock').style.display = 'none';

    document.getElementById('mainBlock').children[2].appendChild(spinner);

    $.ajax(
    {
      method: 'PUT',
      dataType: 'json',
      data: { serviceUuid: document.getElementById('mainBlock').getAttribute('name'), folderUuid: currentFolderUuid },
      timeout: 5000,
      url: '/queries/storage/services/get-parent-folder',

      error: (xhr, textStatus, errorThrown) =>
      {
        spinner.remove();

        if(document.getElementById('filesBlock')) document.getElementById('filesBlock').removeAttribute('style');

        xhr.responseJSON != undefined ?
        displayErrorMessage(xhr.responseJSON.message, xhr.responseJSON.detail) :
        displayErrorMessage('Une erreur est survenue, veuillez réessayer plus tard', null);
      }

    }).done((json) =>
    {
      document.getElementById('actions').children[0].innerText = document.getElementById('actions').children[0].innerText.split(' : ')[0] + ' : 0';

      document.getElementById('filesBlock').innerHTML = '';
      document.getElementById('filesBlock').removeAttribute('style');

      var currentPathElements = document.getElementById('currentPath').children;

      currentPathElements[currentPathElements.length - 1].remove();
      currentPathElements[currentPathElements.length - 1].setAttribute('class', 'currentPathBlockSelected');
      currentPathElements[currentPathElements.length - 1].removeAttribute('onclick');

      document.getElementById('filesBlock').setAttribute('name', currentPathElements[currentPathElements.length - 1].getAttribute('name'));

      spinner.remove();

      // Add each folder from current folder

      for(var folder in json.result.folders)
      {
        addFolder(json.result.folders[folder]);
      }

      // Add a root folder only if we are not already at the first root

      if(json.result.parentFolder !== null)
      {
        addReturnFolder(json.result.parentFolder);
      }

      // Add each file from current folder

      for(var file in json.result.files)
      {
        addFile(json.result.files[file]);
      }

      applyDetailClickEventOnFiles();
    });
  }
}

/****************************************************************************************************/

function addFolder(folderData)
{
  var folder      = document.createElement('div');
  var icon        = document.createElement('div');
  var name        = document.createElement('div');

  name            .innerText = folderData.name;
  icon            .innerHTML = '<i class="fas fa-folder-open fa-rotate-90"></i>';
  folder          .setAttribute('id', folderData.uuid);
  folder          .setAttribute('onclick', `checkSingleOrDoubleClick("${folderData.uuid}")`);

  switch(document.getElementById('selectedDisplay').getAttribute('name'))
  {
    case 'large':

      folder.setAttribute('class', 'storageAppServiceFolderLarge');
      icon.setAttribute('class', 'storageAppServiceFolderLargeIcon');
      name.setAttribute('class', 'storageAppServiceFolderLargeName');

    break;

    case 'small':

      folder.setAttribute('class', 'storageAppServiceFolderSmall');
      icon.setAttribute('class', 'storageAppServiceFolderSmallIcon');
      name.setAttribute('class', 'storageAppServiceFolderSmallName');

    break;

    case 'list':

      folder.setAttribute('class', 'storageAppServiceFolderList');
      icon.setAttribute('class', 'storageAppServiceFolderListIcon');
      name.setAttribute('class', 'storageAppServiceFolderListName');

    break;
  }

  folder.appendChild(icon);
  folder.appendChild(name);

  document.getElementById('filesBlock').insertBefore(folder, document.getElementById('filesBlock').firstChild);
}

/****************************************************************************************************/

function addReturnFolder(folderUuid)
{
  var folder      = document.createElement('div');
  var icon        = document.createElement('div');
  var background  = document.createElement('div');
  var name        = document.createElement('div');

  name            .innerText = '...';
  background      .innerHTML = '<i class="fas fa-folder-open fa-rotate-90">';
  icon            .innerHTML = '<i class="fas fa-reply"></i>';
  folder          .setAttribute('id', folderUuid);
  folder          .setAttribute('name', 'return');
  folder          .setAttribute('ondblclick', `browseToParentFolder("${folderUuid}")`);

  switch(document.getElementById('selectedDisplay').getAttribute('name'))
  {
    case 'large':

      folder.setAttribute('class', 'storageAppServiceReturnLarge');
      background.setAttribute('class', 'storageAppServiceReturnBackgroundLarge');
      icon.setAttribute('class', 'storageAppServiceReturnIconLarge');
      name.setAttribute('class', 'storageAppServiceReturnNameLarge');

    break;

    case 'small':

    folder.setAttribute('class', 'storageAppServiceReturnSmall');
    background.setAttribute('class', 'storageAppServiceReturnBackgroundSmall');
    icon.setAttribute('class', 'storageAppServiceReturnIconSmall');
    name.setAttribute('class', 'storageAppServiceReturnNameSmall');

    break;

    case 'list':

    folder.setAttribute('class', 'storageAppServiceReturnList');
    background.setAttribute('class', 'storageAppServiceReturnBackgroundList');
    icon.setAttribute('class', 'storageAppServiceReturnIconList');
    name.setAttribute('class', 'storageAppServiceReturnNameList');

    break;
  }

  folder.appendChild(background);
  folder.appendChild(icon);
  folder.appendChild(name);

  document.getElementById('filesBlock').insertBefore(folder, document.getElementById('filesBlock').firstChild);
}

/****************************************************************************************************/

function addFile(fileData)
{
  $.ajax(
  {
    method: 'PUT', dataType: 'json', timeout: 5000, url: '/queries/storage/services/get-rights-for-service', data: { serviceUuid: document.getElementById('mainBlock').getAttribute('name') },
    error: (xhr, textStatus, errorThrown) => {  }

  }).done((json) =>
  {
    const rights = json.rights;

    var tag = null;

    var file        = document.createElement('div');
    var icon        = document.createElement('div');
    var name        = document.createElement('div');
    var checkbox    = document.createElement('input');

    checkbox        .setAttribute('type', 'checkbox');
    name            .innerText = fileData.name + '.' + fileData.extension;
    file            .setAttribute('id', fileData.uuid);

    file            .addEventListener('click', openFileDetail);

    switch(fileData.extension)
    {
      case 'doc': icon.innerHTML = '<i class="far fa-file-word"></i>'; tag = 'doc'; break;
      case 'docx': icon.innerHTML = '<i class="far fa-file-word"></i>'; tag = 'doc'; break;
      case 'xls': icon.innerHTML = '<i class="far fa-file-excel"></i>'; tag = 'xls'; break;
      case 'xlsx': icon.innerHTML = '<i class="far fa-file-excel"></i>'; tag = 'xls'; break;
      case 'ppt': icon.innerHTML = '<i class="far fa-file-powerpoint"></i>'; tag = 'ppt'; break;
      case 'pptx': icon.innerHTML = '<i class="far fa-file-powerpoint"></i>'; tag = 'ppt'; break;
      case 'pdf': icon.innerHTML = '<i class="far fa-file-pdf"></i>'; tag = 'pdf'; break;
      case 'txt': icon.innerHTML = '<i class="far fa-file-alt"></i>'; tag = 'txt'; break;
      case 'png': icon.innerHTML = '<i class="far fa-file-picture"></i>'; tag = 'png'; break;
      case 'jpg': icon.innerHTML = '<i class="far fa-file-picture"></i>'; tag = 'png'; break;
      case 'zip': icon.innerHTML = '<i class="far fa-file-archive"></i>'; tag = 'zip'; break;
      case 'rar': icon.innerHTML = '<i class="far fa-file-archive"></i>'; tag = 'zip'; break;
      default : icon.innerHTML = '<i class="far fa-file"></i>'; tag = 'default'; break;
    }

    var filters = document.getElementsByName('filter');

    for(var x = 0; x < filters.length; x++)
    {
      if(tag === filters[x].getAttribute('value') && filters[x].checked == false)
      {
        file.style.display = 'none';
      }
    }

    file.setAttribute('tag', tag);

    switch(document.getElementById('selectedDisplay').getAttribute('name'))
    {
      case 'large':

        file.setAttribute('class', 'storageAppServicesFilesLarge');
        icon.setAttribute('class', `storageAppServicesFilesLargeIcon ${tag}`);
        name.setAttribute('class', 'storageAppServicesFilesLargeName');
        checkbox.setAttribute('class', 'storageAppServicesFilesLargeCheckbox');

      break;

      case 'small':

        file.setAttribute('class', 'storageAppServicesFilesSmall');
        icon.setAttribute('class', `storageAppServicesFilesSmallIcon ${tag}`);
        name.setAttribute('class', 'storageAppServicesFilesSmallName');
        checkbox.setAttribute('class', 'storageAppServicesFilesSmallCheckbox');

      break;

      case 'list':

        file.setAttribute('class', 'storageAppServicesFilesList');
        icon.setAttribute('class', `storageAppServicesFilesListIcon ${tag}`);
        name.setAttribute('class', 'storageAppServicesFilesListName');
        checkbox.setAttribute('class', 'storageAppServicesFilesListCheckbox');

      break;
    }

    file.appendChild(icon);
    file.appendChild(name);

    if(rights.downloadFiles || rights.removeFiles) file.appendChild(checkbox);

    document.getElementById('filesBlock').appendChild(file);
  });
}

/****************************************************************************************************/
