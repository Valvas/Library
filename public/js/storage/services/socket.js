/****************************************************************************************************/

var socket = io();

/****************************************************************************************************/

socket.on('connect', () =>
{
  socket.emit('storageAppServicesDetailJoin', document.getElementById('serviceUuid').getAttribute('name'));
});

/****************************************************************************************************/

socket.on('fileUploaded', (file, oldFileUuid, folderUuid, isGlobalAdmin, serviceRights, accountData, storageAppStrings) =>
{
  if(document.getElementById('currentFolder') == null) return;

  if(oldFileUuid != null)
  {
    var currentFolderFiles = document.getElementById('currentFolder').children;

    for(var x = 0; x < currentFolderFiles.length; x++)
    {
      if(currentFolderFiles[x].getAttribute('name') === oldFileUuid) currentFolderFiles[x].remove();
    }
  }

  if(folderUuid == null && document.getElementById('currentFolder').hasAttribute('name')) return;

  if(folderUuid !== document.getElementById('currentFolder').getAttribute('name')) return;

  var display = null, input = false, icon = null;

  if(document.getElementById('selectedDisplay').getAttribute('name') === 'largeGrid') display = 'serviceElementsFileLargeGrid';
  if(document.getElementById('selectedDisplay').getAttribute('name') === 'smallGrid') display = 'serviceElementsFileSmallGrid';
  if(document.getElementById('selectedDisplay').getAttribute('name') === 'list') display = 'serviceElementsFileList';

  if(serviceRights.downloadFiles || serviceRights.removeFiles || isGlobalAdmin || serviceRights.isAdmin) input = true;

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

  input
  ? document.getElementById('currentFolder').innerHTML += `<div name="${file.uuid}" class="${display}"><input onclick="updateSelectedFiles(this)" class="checkbox" type="checkbox" />${icon}<div class="name">${file.name}</div></div>`
  : document.getElementById('currentFolder').innerHTML += `<div name="${file.uuid}" class="${display}">${icon}<div class="name">${file.name}</div></div>`;

  var message = storageAppStrings.services.detailPage.socket.fileUploaded;

  message = message.replace('[$1$]', `<b>${file.name}</b>`);
  message = message.replace('[$2$]', `<b>${accountData.firstname.charAt(0).toUpperCase()}${accountData.firstname.slice(1).toLowerCase()} ${accountData.lastname.charAt(0).toUpperCase()}${accountData.lastname.slice(1).toLowerCase()}</b>`);

  displayInfo(message, null, null);
});

/****************************************************************************************************/

socket.on('fileRemoved', (fileUuid, storageAppStrings) =>
{
  const elements = document.getElementById('currentFolder').children;

  for(var x = 0; x < elements.length; x++)
  {
    if(elements[x].getAttribute('name') === fileUuid)
    {
      const fileName = elements[x].children.length === 3
      ? elements[x].children[2].innerText
      : elements[x].children[1].innerText;

      displayInfo(storageAppStrings.services.detailPage.socket.fileRemoved.replace('[$1$]', fileName), null, null);

      if(elements[x].children[0].tagName === 'INPUT')
      {
        elements[x].children[0].checked = false;
        updateSelectedFiles(elements[x].children[0]);
      }

      elements[x].remove();
    }
  }
});

/****************************************************************************************************/

socket.on('updateFileLogs', (fileUuid, fileLogs) =>
{
  
});

/****************************************************************************************************/

socket.on('folderCreated', (folderData, parentFolderUuid, accountData, storageAppStrings) =>
{
  if(document.getElementById('currentFolder') == null) return;

  if(parentFolderUuid == null && document.getElementById('currentFolder').hasAttribute('name')) return;

  if(parentFolderUuid !== document.getElementById('currentFolder').getAttribute('name')) return;

  var folderBlock = document.createElement('div');

  if(document.getElementById('selectedDisplay').getAttribute('name') === 'largeGrid') folderBlock.setAttribute('class', 'serviceElementsFileLargeGrid');
  if(document.getElementById('selectedDisplay').getAttribute('name') === 'smallGrid') folderBlock.setAttribute('class', 'serviceElementsFileSmallGrid');
  if(document.getElementById('selectedDisplay').getAttribute('name') === 'list') folderBlock.setAttribute('class', 'serviceElementsFileList');

  folderBlock.setAttribute('name', folderData.uuid);
  folderBlock.setAttribute('ondblclick', `browseFolder("${folderData.uuid}")`);

  folderBlock.innerHTML += `<div class="icon serviceElementsFolder"><i class="far fa-folder-open"></i></div><div class="name">${folderData.name}</div>`;

  document.getElementById('currentFolder').insertBefore(folderBlock, document.getElementById('currentFolder').children[0]);

  var message = storageAppStrings.services.detailPage.socket.folderCreated;

  message = message.replace('[$1$]', `<b>${folderData.name}</b>`);
  message = message.replace('[$2$]', `<b>${accountData.firstname.charAt(0).toUpperCase()}${accountData.firstname.slice(1).toLowerCase()} ${accountData.lastname.charAt(0).toUpperCase()}${accountData.lastname.slice(1).toLowerCase()}</b>`);

  displayInfo(message, null, null);
});

/****************************************************************************************************/

socket.on('folderNameUpdated', (folderUuid, newFolderName) =>
{
  
});

/****************************************************************************************************/