/****************************************************************************************************/

function loadServiceStorageSection()
{
  if(selectedDisplay == null) selectedDisplay = 'large';

  if(urlParameters.length === 0) return loadLocation('home');

  displayLocationLoader();

  const currentServiceUuid = urlParameters[0];

  currentServiceAccountRights = null;

  history.pushState(null, null, `/storage/service/${currentServiceUuid}`);

  $.ajax(
  {
    type: 'PUT', timeout: 10000, data: { serviceUuid: currentServiceUuid, folderUuid: null }, dataType: 'JSON', url: '/queries/storage/services/get-folder-content', success: () => {},
    error: (xhr, status, error) =>
    {
      if(document.getElementById('locationLoaderVerticalBlock')) document.getElementById('locationLoaderVerticalBlock').remove();

      xhr.responseJSON != undefined ?
      displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'loadDirectorySectionError') :
      displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'loadDirectorySectionError');
    }

  }).done((result) =>
  {
    const currentServiceData = result;

    $.ajax(
    {
      type: 'POST', timeout: 10000, data: { serviceUuid: currentServiceUuid }, dataType: 'JSON', url: '/queries/storage/services/get-rights-on-service', success: () => {},
      error: (xhr, status, error) =>
      {
        if(document.getElementById('locationLoaderVerticalBlock')) document.getElementById('locationLoaderVerticalBlock').remove();

        xhr.responseJSON != undefined ?
        displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'loadDirectorySectionError') :
        displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'loadDirectorySectionError');
      }

    }).done((result) =>
    {
      currentServiceAccountRights = result;

      const container = document.createElement('div');

      container.setAttribute('id', 'serviceStorageContainer');
      container.setAttribute('name', currentServiceUuid);
      container.setAttribute('class', 'serviceStorageContainer');

      loadServiceSectionCreateHeader(currentServiceUuid, currentServiceData, container, () =>
      {
        container.style.display = 'none';

        document.getElementById('contentContainer').appendChild(container);

        for(var x = 0; x < currentServiceData.elements.folders.length; x++)
        {
          appendFolderToContainer(currentServiceData.elements.folders[x]);
        }

        for(var x = 0; x < currentServiceData.elements.files.length; x++)
        {
          appendFileToContainer(currentServiceData.elements.files[x], currentServiceData.serviceRights);
        }

        if(document.getElementById('locationLoaderContainer')) document.getElementById('locationLoaderContainer').remove();

        $(container).fadeIn(250);

        if(currentServiceData.elements.folders.length === 0 && currentServiceData.elements.files.length === 0) document.getElementById('currentServiceEmptyFolder').style.display = 'block';
      });
    });
  });
}

/****************************************************************************************************/

function loadServiceSectionCreateHeader(currentServiceUuid, currentServiceData, container, callback)
{
  const header        = document.createElement('div');
  const mainBlock     = document.createElement('div');
  const headerName    = document.createElement('div');
  const headerReturn  = document.createElement('button');

  mainBlock           .setAttribute('id', 'currentServiceContent');

  header              .setAttribute('class', 'serviceStorageContainerHeader');
  headerName          .setAttribute('class', 'serviceStorageContainerHeaderName');
  headerReturn        .setAttribute('class', 'serviceStorageContainerHeaderReturn');

  headerName          .innerText = `${servicesData[currentServiceUuid].name.charAt(0).toUpperCase()}${servicesData[currentServiceUuid].name.slice(1).toLowerCase()}`;
  headerReturn        .innerText = commonStrings.global.back;

  headerReturn        .addEventListener('click', () =>
  {
    loadLocation('home');
  });

  header              .appendChild(headerName);
  header              .appendChild(headerReturn);
  container           .appendChild(header);
  container           .appendChild(mainBlock);

  return loadServiceSectionCreateToolbox(currentServiceUuid, currentServiceData, mainBlock, callback);
}

/****************************************************************************************************/

function loadServiceSectionCreateToolbox(currentServiceUuid, currentServiceData, container, callback)
{
  const toolbox                 = document.createElement('div');
  const toolboxActions          = document.createElement('div');
  const toolBoxCounter          = document.createElement('div');
  const toolBoxSearchCounter    = document.createElement('div');
  const toolBoxSearch           = document.createElement('div');

  const actionsLeft       = document.createElement('div');
  const actionsRight      = document.createElement('div');

  const leftUploadFile    = document.createElement('button');
  const leftCreateFolder  = document.createElement('button');

  const rightUnselect     = document.createElement('button');
  const rightDownload     = document.createElement('button');
  const rightRemove       = document.createElement('button');

  const searchForm        = document.createElement('form');

  const selectDisplay     = document.createElement('select');

  selectDisplay           .setAttribute('id', 'serviceStorageSelectedDisplay');
  rightUnselect           .setAttribute('id', 'serviceStorageUnselectFiles');
  rightDownload           .setAttribute('id', 'serviceStorageDownloadFiles');
  rightRemove             .setAttribute('id', 'serviceStorageRemoveFiles');

  toolbox                 .setAttribute('class', 'serviceStorageContainerTools');
  toolboxActions          .setAttribute('class', 'serviceStorageContainerToolsActions');
  actionsLeft             .setAttribute('class', 'serviceStorageContainerToolsActionsLeft');
  actionsRight            .setAttribute('class', 'serviceStorageContainerToolsActionsRight');
  leftUploadFile          .setAttribute('class', 'serviceStorageContainerToolsActionsActivatedButton');
  leftCreateFolder        .setAttribute('class', 'serviceStorageContainerToolsActionsActivatedButton');
  rightUnselect           .setAttribute('class', 'serviceStorageContainerToolsActionsDisabledButton');
  rightDownload           .setAttribute('class', 'serviceStorageContainerToolsActionsDisabledButton');
  rightRemove             .setAttribute('class', 'serviceStorageContainerToolsActionsDisabledButton');
  toolBoxCounter          .setAttribute('class', 'serviceStorageContainerToolsCounter');
  toolBoxSearch           .setAttribute('class', 'serviceStorageContainerToolsEnd');
  searchForm              .setAttribute('class', 'serviceStorageContainerToolsEndSearchForm');
  selectDisplay           .setAttribute('class', 'serviceStorageContainerToolsEndDisplay');

  searchForm              .addEventListener('submit', searchForElementsRetrieveFromServer);

  searchForm              .innerHTML += `<input id="serviceSearchBar" type="text" placeholder="${storageStrings.serviceSection.header.searchBarPlaceholder}" name="search" />`;
  searchForm              .innerHTML += `<button>${storageStrings.serviceSection.header.searchButton}</button>`;

  toolBoxCounter          .innerHTML += `<div class="serviceStorageContainerToolsCounterKey">${storageStrings.serviceSection.header.counterKey} :</div>`;
  toolBoxCounter          .innerHTML += `<div id="serviceStorageContainerToolsCounterValue" class="serviceStorageContainerToolsCounterValue">0</div>`;

  selectDisplay           .innerHTML += selectedDisplay === 'large'
  ? `<option value="large" selected>${storageStrings.serviceSection.header.largeDisplay}</option>`
  : `<option value="large">${storageStrings.serviceSection.header.largeDisplay}</option>`;

  selectDisplay           .innerHTML += selectedDisplay === 'small'
  ? `<option value="small" selected>${storageStrings.serviceSection.header.smallDisplay}</option>`
  : `<option value="small">${storageStrings.serviceSection.header.smallDisplay}</option>`;

  selectDisplay           .innerHTML += selectedDisplay === 'list'
  ? `<option value="list" selected>${storageStrings.serviceSection.header.listDisplay}</option>`
  : `<option value="list">${storageStrings.serviceSection.header.listDisplay}</option>`;

  leftUploadFile          .innerText = storageStrings.serviceSection.header.uploadButton;
  leftCreateFolder        .innerText = storageStrings.serviceSection.header.createFolderButton;
  rightUnselect           .innerText = storageStrings.serviceSection.header.unselectFilesButton;
  rightDownload           .innerText = storageStrings.serviceSection.header.downloadButton;
  rightRemove             .innerText = storageStrings.serviceSection.header.removeButton;

  leftUploadFile          .addEventListener('click', uploadFileRetrieveParameters);
  leftCreateFolder        .addEventListener('click', createFolderOpenPrompt);
  selectDisplay           .addEventListener('change', changeDisplay);

  if(currentServiceData.serviceRights.uploadFiles || currentServiceData.serviceRights.isAdmin)    actionsLeft.appendChild(leftUploadFile);
  if(currentServiceData.serviceRights.createFolders || currentServiceData.serviceRights.isAdmin)  actionsLeft.appendChild(leftCreateFolder);

  actionsRight          .appendChild(rightUnselect);

  if(currentServiceData.serviceRights.downloadFiles || currentServiceData.serviceRights.isAdmin)  actionsRight.appendChild(rightDownload);
  if(currentServiceData.serviceRights.removeFiles || currentServiceData.serviceRights.isAdmin)    actionsRight.appendChild(rightRemove);

  toolboxActions          .appendChild(actionsLeft);
  toolboxActions          .appendChild(actionsRight);
  toolBoxSearch           .appendChild(searchForm);
  toolBoxSearch           .appendChild(selectDisplay);
  toolbox                 .appendChild(toolboxActions);
  toolbox                 .appendChild(toolBoxCounter);
  toolbox                 .appendChild(toolBoxSearch);
  container               .appendChild(toolbox);

  return loadServiceSectionCreatePath(container, callback);
}

/****************************************************************************************************/

function loadServiceSectionCreatePath(container, callback)
{
  const path      = document.createElement('div');
  const pathRoot  = document.createElement('span');

  path            .setAttribute('id', 'serviceStorageContainerPath');

  path            .setAttribute('class', 'serviceStorageContainerPath');
  pathRoot        .setAttribute('class', 'serviceStorageContainerPathElement');

  pathRoot        .innerText = storageStrings.serviceSection.pathRoot;

  pathRoot        .addEventListener('click', () =>
  {
    browseFolder(null);
  });

  path        .appendChild(pathRoot);
  container   .appendChild(path);

  return loadServiceSectionCreateMessages(container, callback);
}

/****************************************************************************************************/

function loadServiceSectionCreateMessages(container, callback)
{
  const emptyFolderMessage = document.createElement('div');

  emptyFolderMessage      .setAttribute('id', 'currentServiceEmptyFolder');

  emptyFolderMessage      .setAttribute('class', 'serviceStorageContainerMessage');

  emptyFolderMessage      .innerText = storageStrings.serviceSection.elementsContainer.emptyFolder;

  container               .appendChild(emptyFolderMessage);

  return loadServiceSectionCreateElementsContainers(container, callback);
}

/****************************************************************************************************/

function loadServiceSectionCreateElementsContainers(container, callback)
{
  const block   = document.createElement('div');
  const folders = document.createElement('div');
  const files   = document.createElement('div');

  block         .setAttribute('id', 'currentServiceFolder');
  folders       .setAttribute('id', 'currentServiceFoldersContainer');
  files         .setAttribute('id', 'currentServiceFilesContainer');

  folders       .setAttribute('class', 'serviceStorageContainerElements');
  files         .setAttribute('class', 'serviceStorageContainerElements');

  block         .appendChild(folders);
  block         .appendChild(files);
  container     .appendChild(block);

  return callback();
}

/****************************************************************************************************/
