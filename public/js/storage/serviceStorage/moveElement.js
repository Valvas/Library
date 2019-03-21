/****************************************************************************************************/
/* RETRIEVE SERVICE STRUCTURE FROM SERVER */
/****************************************************************************************************/

function moveElementRetrieveStructure(elementUuid)
{
  if(document.getElementById('veilBackground')) return;

  const serviceUuid = document.getElementById('serviceStorageContainer').getAttribute('name');

  /********************************************************************************/

  document.getElementById('mainContainer').style.filter ='blur(4px)';

  const modalVeil       = document.createElement('div');
  const modalBackground = document.createElement('div');
  const modalContainer  = document.createElement('div');

  modalVeil         .setAttribute('id', 'modalVeil');
  modalBackground   .setAttribute('id', 'modalBackground');
  modalContainer    .setAttribute('id', 'modalContainer');

  modalBackground   .appendChild(modalContainer);
  document.body     .appendChild(modalBackground);
  document.body     .appendChild(modalVeil);

  /********************************************************************************/

  displayLoader(storageStrings.serviceSection.moveElementModal.loaderMessage, (loader) =>
  {
    $.ajax(
    {
      method: 'PUT', timeout: 10000, data: { folderUuid: null, serviceUuid: serviceUuid }, dataType: 'JSON', url: '/queries/storage/services/get-folder-content', success: () => {},
      error: (xhr, status, error) =>
      {
        removeLoader(loader, () =>
        {
          document.getElementById('mainContainer').removeAttribute('style');
          modalBackground.remove();
          modalVeil.remove();

          xhr.responseJSON != undefined ?
          displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'moveElementError') :
          displayError(commonStrings.global.xhrErrors.timeout, null, 'moveElementError');
        });
      }

    }).done((result) =>
    {
      removeLoader(loader, () =>
      {
        return moveElementCreateModal(result.elements.folders, elementUuid);
      });
    });
  });
}

/****************************************************************************************************/
/* CREATE MODAL WITH FOLDER STRUCTURE */
/****************************************************************************************************/

function moveElementCreateModal(folderContent, elementUuid)
{
  const modal               = document.createElement('div');
  const modalHeader         = document.createElement('div');
  const modalContent        = document.createElement('div');
  const modalContentPath    = document.createElement('div');
  const modalContentFolders = document.createElement('div');
  const modalButtons        = document.createElement('div');
  const modalButtonsSubmit  = document.createElement('button');
  const modalButtonsCancel  = document.createElement('button');

  modal               .setAttribute('id', 'moveElementModal');

  modal               .setAttribute('class', 'serviceMoveFileModal');
  modalHeader         .setAttribute('class', 'serviceMoveFileModalHeader');
  modalContent        .setAttribute('class', 'serviceMoveFileModalContent');
  modalContentPath    .setAttribute('class', 'serviceMoveFileModalContentPath');
  modalContentFolders .setAttribute('class', 'serviceMoveFileModalContentFolders');
  modalButtons        .setAttribute('class', 'serviceMoveFileModalButtons');
  modalButtonsSubmit  .setAttribute('class', 'serviceMoveFileModalButtonsSubmit');
  modalButtonsCancel  .setAttribute('class', 'serviceMoveFileModalButtonsCancel');

  modalHeader         .innerText = storageStrings.serviceSection.moveElementModal.header;
  modalButtonsSubmit  .innerText = storageStrings.serviceSection.moveElementModal.submit;
  modalButtonsCancel  .innerText = commonStrings.global.cancel;

  modalContentPath    .innerHTML += `<span>${storageStrings.serviceSection.moveElementModal.pathRoot}</span><div class="serviceMoveFileModalContentPathSeparator">/</div>`;

  for(var x = 0; x < folderContent.length; x++)
  {
    const currentFolderUuid = folderContent[x].uuid;

    const currentFolder     = document.createElement('div');
    const currentFolderIcon = document.createElement('div');
    const currentFolderName = document.createElement('div');

    currentFolder           .setAttribute('class', 'serviceMoveFileModalContentFoldersElement');
    currentFolderIcon       .setAttribute('class', 'serviceMoveFileModalContentFoldersElementIcon');
    currentFolderName       .setAttribute('class', 'serviceMoveFileModalContentFoldersElementName');

    currentFolder           .setAttribute('name', currentFolderUuid);

    currentFolderIcon       .innerHTML = '<i class="fas fa-folder-open"></i>';
    currentFolderName       .innerText = folderContent[x].name;

    currentFolder           .addEventListener('dblclick', () =>
    {
      moveElementBrowseFolder(currentFolderUuid);
    });

    currentFolder           .appendChild(currentFolderIcon);
    currentFolder           .appendChild(currentFolderName);
    modalContentFolders     .appendChild(currentFolder);
  }

  modalButtonsSubmit  .addEventListener('click', () =>
  {
    const currentFolderUuid = modalContentFolders.getAttribute('name');

    event.stopPropagation();

    moveElementSendRequestToServer(elementUuid, currentFolderUuid);
  });

  modalButtonsCancel  .addEventListener('click', () =>
  {
    event.stopPropagation();
    document.getElementById('mainContainer').removeAttribute('style');
    document.getElementById('modalBackground').remove();
    document.getElementById('modalVeil').remove();
  });

  modalButtons        .appendChild(modalButtonsSubmit);
  modalButtons        .appendChild(modalButtonsCancel);

  modalContent        .appendChild(modalContentPath);
  modalContent        .appendChild(modalContentFolders);

  modal               .appendChild(modalHeader);
  modal               .appendChild(modalContent);
  modal               .appendChild(modalButtons);

  document.getElementById('modalContainer').appendChild(modal);
}

/****************************************************************************************************/
/* RETRIEVE FOLDERS INSIDE A BROWSED ONE */
/****************************************************************************************************/

function moveElementBrowseFolder(folderUuid)
{
  const foldersContainer = document.getElementById('moveElementModal').getElementsByClassName('serviceMoveFileModalContentFolders')[0];

  const serviceUuid = document.getElementById('serviceStorageContainer').getAttribute('name');

  foldersContainer.innerHTML = '<div class="serviceMoveFileModalContentFoldersLoading"></div>';

  foldersContainer.setAttribute('name', folderUuid);

  /********************************************************************************/

  $.ajax(
  {
    method: 'PUT', timeout: 10000, data: { folderUuid: folderUuid, serviceUuid: serviceUuid }, dataType: 'JSON', url: '/queries/storage/services/get-folder-content', success: () => {},
    error: (xhr, status, error) =>
    {
      removeLoader(loader, () =>
      {
        document.getElementById('mainContainer').removeAttribute('style');
        modalBackground.remove();
        modalVeil.remove();

        xhr.responseJSON != undefined ?
        displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'moveElementError') :
        displayError(commonStrings.global.xhrErrors.timeout, null, 'moveElementError');
      });
    }

  }).done((result) =>
  {
    foldersContainer.innerHTML = '';

    moveElementCreatePath(result.folderPath, () =>
    {
      for(var x = 0; x < result.elements.folders.length; x++)
      {
        moveElementAppendFolderToContainer(result.elements.folders[x]);
      }
    });
  });
}

/****************************************************************************************************/
/* APPEND A FOLDER TO THE CONTAINER */
/****************************************************************************************************/

function moveElementAppendFolderToContainer(folderData)
{
  const foldersContainer = document.getElementById('moveElementModal').getElementsByClassName('serviceMoveFileModalContentFolders')[0];

  const folderUuid = folderData.uuid;

  const folder      = document.createElement('div');
  const folderIcon  = document.createElement('div');
  const folderName  = document.createElement('div');

  folder            .setAttribute('class', 'serviceMoveFileModalContentFoldersElement');
  folderIcon        .setAttribute('class', 'serviceMoveFileModalContentFoldersElementIcon');
  folderName        .setAttribute('class', 'serviceMoveFileModalContentFoldersElementName');

  folder            .setAttribute('name', folderUuid);

  folderIcon        .innerHTML = '<i class="fas fa-folder-open"></i>';
  folderName        .innerText = folderData.name;

  folder            .addEventListener('dblclick', () =>
  {
    moveElementBrowseFolder(folderUuid);
  });

  folder            .appendChild(folderIcon);
  folder            .appendChild(folderName);

  /********************************************************************************/

  const currentFolders = foldersContainer.children;

  var indexWhereToInsert = 0;

  for(var x = 0; x < currentFolders.length; x++)
  {
    if(currentFolders[x].children[1].innerText.localeCompare(folderData.name) > 0) break;

    indexWhereToInsert += 1;
  }

  foldersContainer.insertBefore(folder, foldersContainer.children[indexWhereToInsert]);
}

/****************************************************************************************************/
/* CREATE THE CURRENT PATH */
/****************************************************************************************************/

function moveElementCreatePath(pathData, callback)
{
  const foldersPath = document.getElementById('moveElementModal').getElementsByClassName('serviceMoveFileModalContentPath')[0];

  foldersPath.innerHTML = '';

  /********************************************************************************/

  const pathRoot = document.createElement('span');

  pathRoot.innerText = storageStrings.serviceSection.moveElementModal.pathRoot;

  pathRoot.setAttribute('onclick', `moveElementBrowseFolder(null)`);

  foldersPath.appendChild(pathRoot);

  foldersPath.innerHTML += '<div class="serviceMoveFileModalContentPathSeparator">/</div>';

  /********************************************************************************/

  for(var x = 0; x < pathData.length; x++)
  {
    const currentElementUuid = pathData[x].uuid;

    const currentElement = document.createElement('span');

    currentElement.innerText = pathData[x].name;

    currentElement.setAttribute('name', currentElementUuid);

    currentElement.setAttribute('onclick', `moveElementBrowseFolder("${currentElementUuid}")`);

    foldersPath.appendChild(currentElement);

    foldersPath.innerHTML += '<div class="serviceMoveFileModalContentPathSeparator">/</div>';
  }

  /********************************************************************************/

  return callback();
}

/****************************************************************************************************/
/* SEND REQUEST TO SERVER */
/****************************************************************************************************/

function moveElementSendRequestToServer(elementUuid, folderUuid)
{
  const serviceUuid = document.getElementById('serviceStorageContainer').getAttribute('name');

  document.getElementById('moveElementModal').style.display = 'none';

  displayLoader(storageStrings.serviceSection.moveElementModal.savingLoader, (loader) =>
  {
    $.ajax(
    {
      method: 'POST', timeout: 10000, data: { elementUuid: elementUuid, targetFolder: folderUuid, serviceUuid: serviceUuid }, dataType: 'JSON', url: '/queries/storage/services/move-element', success: () => {},
      error: (xhr, status, error) =>
      {
        removeLoader(loader, () =>
        {
          document.getElementById('moveElementModal').removeAttribute('style');

          xhr.responseJSON != undefined ?
          displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'moveElementError') :
          displayError(commonStrings.global.xhrErrors.timeout, null, 'moveElementError');
        });
      }

    }).done((result) =>
    {
      removeLoader(loader, () =>
      {
        document.getElementById('mainContainer').removeAttribute('style');
        modalBackground.remove();
        modalVeil.remove();

        return displaySuccess(result.message, null, 'moveElementSuccess');
      });
    });
  });
}

/****************************************************************************************************/
