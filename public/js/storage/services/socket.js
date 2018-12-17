/****************************************************************************************************/

var socket = io();

/****************************************************************************************************/

socket.on('connect', () =>
{
  socket.emit('storageAppServicesDetailJoin', document.getElementById('serviceUuid').getAttribute('name'));
});

/****************************************************************************************************/

socket.on('fileUploaded', (file, oldFileUuid, folderUuid, accountData, storageAppStrings) =>
{
  if(document.getElementById('currentFolder') == null) return;

  $.ajax(
  {
    method: 'PUT', dataType: 'json', data: { serviceUuid: document.getElementById('serviceUuid').getAttribute('name') }, timeout: 5000, url: '/queries/storage/services/get-account-rights-towards-service',

    error: (xhr, textStatus, errorThrown) => { return }

  }).done((result) =>
  {
    const isAppAdmin    = result.isAppAdmin;
    const serviceRights = result.serviceRights;

    if(oldFileUuid != null)
    {
      var currentFolderFiles = document.getElementById('filesContainer').children;

      for(var x = 0; x < currentFolderFiles.length; x++)
      {
        if(currentFolderFiles[x].getAttribute('name') === oldFileUuid) currentFolderFiles[x].remove();
      }
    }

    if(folderUuid == null && document.getElementById('currentFolder').hasAttribute('name')) return;

    if(folderUuid !== document.getElementById('currentFolder').getAttribute('name')) return;

    var display = null, input = false, icon = null, searched = false;

    if(document.getElementById('selectedDisplay').getAttribute('name') === 'largeGrid') display = 'serviceElementsFileLargeGrid';
    if(document.getElementById('selectedDisplay').getAttribute('name') === 'smallGrid') display = 'serviceElementsFileSmallGrid';
    if(document.getElementById('selectedDisplay').getAttribute('name') === 'list') display = 'serviceElementsFileList';

    if(serviceRights.downloadFiles || serviceRights.removeFiles || isAppAdmin || serviceRights.isAdmin) input = true;

    switch(file.name.split('.')[file.name.split('.').length - 1])
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

    if(document.getElementById('filesAndFoldersSearchBar'))
    {
      if(document.getElementById('filesAndFoldersSearchBar').value.length === 0 || file.name.includes(document.getElementById('filesAndFoldersSearchBar').value)) searched = true;
    }

    input
    ? searched
      ? document.getElementById('filesContainer').innerHTML += `<div name="${file.uuid}" class="${display}"><input class="checkbox" type="checkbox" />${icon}<div class="name">${file.name}</div></div>`
      : document.getElementById('filesContainer').innerHTML += `<div name="${file.uuid}" class="${display}" style="display:none"><input class="checkbox" type="checkbox" />${icon}<div class="name">${file.name}</div></div>`
    : searched
      ? document.getElementById('filesContainer').innerHTML += `<div name="${file.uuid}" class="${display}">${icon}<div class="name">${file.name}</div></div>`
      : document.getElementById('filesContainer').innerHTML += `<div name="${file.uuid}" class="${display}" style="display:none">${icon}<div class="name">${file.name}</div></div>`;

    var message = storageAppStrings.services.detailPage.socket.fileUploaded;

    message = message.replace('[$1$]', `<b>${file.name}</b>`);
    message = message.replace('[$2$]', `<b>${accountData.firstname.charAt(0).toUpperCase()}${accountData.firstname.slice(1).toLowerCase()} ${accountData.lastname.charAt(0).toUpperCase()}${accountData.lastname.slice(1).toLowerCase()}</b>`);

    displayInfo(message, null, null);

    addEventListenersOnFilesForDetail();
  });
});

/****************************************************************************************************/

socket.on('fileRemoved', (fileUuid, storageAppStrings) =>
{
  if(document.getElementById('fileDetailAside'))
  {
    if(document.getElementById('fileDetailAside').getAttribute('name') === fileUuid)
    {
      document.getElementById('fileDetailAside').remove();
      document.getElementById('fileDetailBackground').remove();
    }
  }
  
  const serviceFiles = document.getElementById('filesContainer').children;

  for(var x = 0; x < serviceFiles.length; x++)
  {
    if(serviceFiles[x].getAttribute('name') === fileUuid)
    {
      const fileName = serviceFiles[x].children.length === 3
      ? serviceFiles[x].children[2].innerText
      : serviceFiles[x].children[1].innerText;

      displayInfo(storageAppStrings.services.detailPage.socket.fileRemoved.replace('[$1$]', `<b>${fileName}</b>`), null, null);

      if(serviceFiles[x].children[0].tagName === 'INPUT')
      {
        if(serviceFiles[x].children[0].checked)
        {
          serviceFiles[x].children[0].checked = false;
          updateSelectedFiles(serviceFiles[x].children[0]);
        }
      }

      serviceFiles[x].remove();
    }
  }
});

/****************************************************************************************************/

socket.on('updateFileLogs', (fileUuid, accountUuid, isAppAdmin, accountRightsOnService, fileLogs, storageAppStrings) =>
{
  if(document.getElementById('fileDetailAside') == null) return;

  if(document.getElementById('fileDetailAside').getAttribute('name') !== fileUuid) return;
  
  if(document.getElementById('fileDetailAsideLogsList') == null) return;

  const currentLogs = document.getElementById('fileDetailAsideLogsList').children;

  const currentLogsUuids = [];

  for(var x = 0; x < currentLogs.length; x++) currentLogsUuids.push(currentLogs[x].getAttribute('name'));

  for(var x = 0; x < fileLogs.length; x++)
  {
    if(currentLogsUuids.includes(fileLogs[x].uuid)) continue;

    var logBlock = document.createElement('div');

    logBlock.innerHTML += `<div>${fileLogs[x].date}</div>`;
    logBlock.innerHTML += `<div>${fileLogs[x].message}</div>`;

    logBlock.setAttribute('name', fileLogs[x].uuid);

    switch(fileLogs[x].type)
    {
      case 0:
        logBlock.setAttribute('class', 'fileLogUpload');
      break;

      case 1:
        logBlock.setAttribute('class', 'fileLogDownload');
      break;

      case 3:
        logBlock.setAttribute('class', 'fileLogComment');

        var showEditButton = isAppAdmin || accountRightsOnService.isAdmin || accountRightsOnService.editAllCommentsOnFile || ((fileLogs[x].account === accountUuid) && accountRightsOnService.editOwnCommentsOnFile);
        var showDeleteButton = isAppAdmin || accountRightsOnService.isAdmin || accountRightsOnService.removeAllCommentsOnFile || ((fileLogs[x].account === accountUuid) && accountRightsOnService.removeOwnCommentsOnFile);

        (showEditButton && showDeleteButton)
        ? logBlock.innerHTML += `<div class="fileLogCommentContent">${fileLogs[x].comment}</div><div class="fileLogCommentButtons"><div onclick="updateCommentGetStrings('${fileLogs[x].uuid}')" class="fileLogCommentButtonsEdit">${storageAppStrings.services.detailPage.fileAsideLogs.editComment}</div><div onclick="removeCommentGetStrings('${fileLogs[x].uuid}')" class="fileLogCommentButtonsDelete">${storageAppStrings.services.detailPage.fileAsideLogs.removeComment}</div></div>`
        : showEditButton
          ? logBlock.innerHTML += `<div class="fileLogCommentContent">${fileLogs[x].comment}</div><div class="fileLogCommentButtons"><div onclick="updateCommentGetStrings('${fileLogs[x].uuid}')" class="fileLogCommentButtonsEdit">${storageAppStrings.services.detailPage.fileAsideLogs.editComment}</div></div>`
          : showDeleteButton
            ? logBlock.innerHTML += `<div class="fileLogCommentContent">${fileLogs[x].comment}</div><div class="fileLogCommentButtons"><div onclick="removeCommentGetStrings('${fileLogs[x].uuid}')" class="fileLogCommentButtonsDelete">${storageAppStrings.services.detailPage.fileAsideLogs.removeComment}</div></div>`
            : logBlock.innerHTML += `<div class="fileLogCommentContent">${fileLogs[x].comment}</div>`;
      break;

      case 4:
        logBlock.setAttribute('class', 'fileLogComment');
        list.innerHTML += `<div class="fileLogCommentRemoved">${storageAppStrings.services.fileDetail.logs.removedCommentMessage}</div>`;
      break;
    }

    document.getElementById('fileDetailAsideLogsList').insertBefore(logBlock, document.getElementById('fileDetailAsideLogsList').children[0]);
  }
});

/****************************************************************************************************/

socket.on('folderCreated', (folderData, parentFolderUuid, accountData, storageAppStrings) =>
{
  if(document.getElementById('currentFolder') == null) return;
  if(document.getElementById('foldersContainer') == null) return;

  if(parentFolderUuid == null && document.getElementById('currentFolder').hasAttribute('name')) return;

  if(parentFolderUuid !== document.getElementById('currentFolder').getAttribute('name')) return;

  var folderBlock = document.createElement('div');

  if(document.getElementById('selectedDisplay').getAttribute('name') === 'largeGrid') folderBlock.setAttribute('class', 'serviceElementsFileLargeGrid');
  if(document.getElementById('selectedDisplay').getAttribute('name') === 'smallGrid') folderBlock.setAttribute('class', 'serviceElementsFileSmallGrid');
  if(document.getElementById('selectedDisplay').getAttribute('name') === 'list') folderBlock.setAttribute('class', 'serviceElementsFileList');

  folderBlock.setAttribute('name', folderData.uuid);
  folderBlock.setAttribute('ondblclick', `browseFolder("${folderData.uuid}")`);

  folderBlock.innerHTML += `<div class="icon serviceElementsFolder"><i class="far fa-folder-open"></i></div><div class="name">${folderData.name}</div>`;

  folderBlock.addEventListener('contextmenu', openFolderMenu);
  folderBlock.addEventListener('dblclick', () => { browseFolder(folderData.uuid) });

  document.getElementById('foldersContainer').insertBefore(folderBlock, document.getElementById('foldersContainer').children[0]);

  var message = storageAppStrings.services.detailPage.socket.folderCreated;

  message = message.replace('[$1$]', `<b>${folderData.name}</b>`);
  message = message.replace('[$2$]', `<b>${accountData.firstname.charAt(0).toUpperCase()}${accountData.firstname.slice(1).toLowerCase()} ${accountData.lastname.charAt(0).toUpperCase()}${accountData.lastname.slice(1).toLowerCase()}</b>`);

  displayInfo(message, null, null);
});

/****************************************************************************************************/

socket.on('folderNameUpdated', (folderUuid, newFolderName, storageAppStrings) =>
{
  if(document.getElementById('foldersContainer'))
  {
    const folders = document.getElementById('foldersContainer').children;

    for(var x = 0; x < folders.length; x++)
    {
      if(folders[x].getAttribute('name') === folderUuid)
      {

        var message = storageAppStrings.services.detailPage.socket.folderRenamed;

        message = message.replace('[$1$]', `<b>${folders[x].children[1].innerText}</b>`);
        message = message.replace('[$2$]', `<b>${newFolderName}</b>`);

        folders[x].children[1].innerText = newFolderName;

        displayInfo(message, null, null);
      }
    }
  }

  if(document.getElementById('folderMenu'))
  {
    if(document.getElementById('folderMenu').getAttribute('name') === folderUuid) document.getElementById('folderMenu').children[0].innerText = newFolderName;
  }

  if(document.getElementById('currentPathLocation') == null) return;

  const pathElements = document.getElementById('currentPathLocation').children;

  for(var x = 0; x < pathElements.length; x++)
  {
    if(pathElements[x].getAttribute('name') === folderUuid) pathElements[x].innerText = newFolderName;
  }
});

/****************************************************************************************************/

socket.on('fileCommentRemoved', (commentUuid, storageAppStrings) =>
{
  if(document.getElementById('fileDetailAsideLogsList') == null) return;

  const fileLogs = document.getElementById('fileDetailAsideLogsList').children;

  for(var x = 0; x < fileLogs.length; x++)
  {
    if(fileLogs[x].getAttribute('name') === commentUuid)
    {
      fileLogs[x].innerHTML = `<div>${fileLogs[x].children[0].innerText}</div><div>${fileLogs[x].children[1].innerText}</div>`;
      fileLogs[x].innerHTML += `<div class="fileLogCommentRemoved">${storageAppStrings.services.fileDetail.logs.removedCommentMessage}</div>`;
    }
  }
});

/****************************************************************************************************/

socket.on('fileCommentUpdated', (commentUuid, newCommentContent) =>
{
  if(document.getElementById('fileDetailAsideLogsList') == null) return;

  const fileLogs = document.getElementById('fileDetailAsideLogsList').children;

  for(var x = 0; x < fileLogs.length; x++)
  {
    if(fileLogs[x].getAttribute('name') === commentUuid) fileLogs[x].children[2].innerText = newCommentContent;
  }
});

/****************************************************************************************************/