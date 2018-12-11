/****************************************************************************************************/

var storageAppStrings = null;

function addEventListenersOnFilesForDetail()
{
  const currentFiles = document.getElementById('filesContainer').children;

  for(var x = 0; x < currentFiles.length; x++)
  {
    const currentFile = currentFiles[x];

    currentFile.addEventListener('contextmenu', openFileDetail);

    currentFile.addEventListener('click', () =>
    {
      if(currentFile.children[0].tagName === 'INPUT')
      {
        currentFile.children[0].checked
        ? currentFile.children[0].checked = false
        : currentFile.children[0].checked = true;

        updateSelectedFiles(currentFile.children[0]);
      }
    });
  }
}

addEventListenersOnFilesForDetail();

/****************************************************************************************************/

function openFileDetail(event)
{
  event.preventDefault();

  if(document.getElementById('currentFolder') == null) return;

  var target = event.target;

  while(target.hasAttribute('name') == false) target = target.parentNode;

  var slideContainer  = document.createElement('div');
  var slideBackground = document.createElement('div');

  slideContainer      .setAttribute('id', 'fileDetailAside');
  slideBackground     .setAttribute('id', 'fileDetailBackground');

  slideContainer      .setAttribute('name', target.getAttribute('name'));

  slideContainer      .setAttribute('class', 'fileDetailAside');
  slideBackground     .setAttribute('class', 'fileDetailBackground');

  slideBackground     .addEventListener('click', () =>
  {
    slideContainer.remove();
    slideBackground.remove();
  });

  slideContainer      .innerHTML += `<div class="fileDetailAsideSpinner"><i class="fas fa-circle-notch fa-spin"></i></div>`;

  document.getElementById('currentFolder').appendChild(slideBackground);
  document.getElementById('currentFolder').appendChild(slideContainer);

  $.ajax(
  {
    method: 'PUT', dataType: 'json', timeout: 10000, data: { fileUuid: target.getAttribute('name') }, url: '/queries/storage/services/get-file-logs',

    error: (xhr, textStatus, errorThrown) =>
    {
      slideContainer.remove();
      slideBackground.remove();

      return xhr.responseJSON != undefined
      ? displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'openFileLogsError')
      : displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'openFileLogsError');
    }

  }).done((result) =>
  {
    if(storageAppStrings != null) return fillFileDetail(result);

    getStorageAppStrings((error, strings) =>
    {
      if(error != null)
      {
        slideContainer.remove();
        slideBackground.remove();

        return displayError(error.message, error.detail, 'openFileLogsError');
      }

      storageAppStrings = strings;

      return fillFileDetail(result);
    });
  });
}

/****************************************************************************************************/

function fillFileDetail(result)
{
  document.getElementById('fileDetailAside').innerHTML = '';

  var close   = document.createElement('div');
  var logs    = document.createElement('div');
  var list    = document.createElement('div');

  list        .setAttribute('id', 'fileDetailAsideLogsList');

  logs        .setAttribute('class', 'fileDetailAsideLogsSection');
  list        .setAttribute('class', 'fileDetailAsideLogsList');
  close       .setAttribute('class', 'fileDetailAsideClose');

  close       .innerText = storageAppStrings.services.detailPage.fileAsideLogs.close;

  close       .addEventListener('click', () => 
  {
    document.getElementById('fileDetailAside').remove();
    document.getElementById('fileDetailBackground').remove();
  });

  document.getElementById('fileDetailAside').innerHTML += `<div class="fileDetailAsideTitle">${storageAppStrings.services.detailPage.fileAsideLogs.title}</div>`;
  document.getElementById('fileDetailAside').innerHTML += `<div class="fileDetailAsideNameContainer"><div class="fileDetailAsideNameLabel">${storageAppStrings.services.detailPage.fileAsideLogs.name} :</div><div class="fileDetailAsideNameValue">${result.fileData.name}</div></div>`;
  document.getElementById('fileDetailAside').innerHTML += `<button onclick="commentFileGetStrings('${result.fileData.uuid}')" class="fileDetailAsideComment">${storageAppStrings.services.detailPage.fileAsideLogs.commentButton}</button>`;

  logs.innerHTML += `<div class="fileDetailAsideLogsTitle">${storageAppStrings.services.detailPage.fileAsideLogs.logsTitle}</div>`;

  for(var x = (result.fileLogs.length - 1); x >= 0; x--)
  {
    switch(result.fileLogs[x].type)
    {
      case 0:
        list.innerHTML += `<div name="${result.fileLogs[x].uuid}" class="fileLogUpload"><div>${result.fileLogs[x].date}</div><div>${result.fileLogs[x].message}</div></div>`;
      break;

      case 1:
        list.innerHTML += `<div name="${result.fileLogs[x].uuid}" class="fileLogDownload"><div>${result.fileLogs[x].date}</div><div>${result.fileLogs[x].message}</div></div>`;
      break;
    }
  }

  logs.appendChild(list);

  document.getElementById('fileDetailAside').appendChild(logs);

  document.getElementById('fileDetailAside').insertBefore(close, document.getElementById('fileDetailAside').children[0]);
}

/****************************************************************************************************/

function openFolderDetail(folderUuid)
{
  var elementDetailBlock                = document.createElement('div');
  var elementDetailBlockTitle           = document.createElement('div');
  var elementDetailBlockClose           = document.createElement('div');
  var elementDetailBlockSpinner         = document.createElement('div');
  var elementDetailBlockNameLabel       = document.createElement('div');
  var elementDetailBlockNameValue       = document.createElement('div');
  var elementDetailBlockContentLabel    = document.createElement('div');
  var elementDetailBlockContentFiles    = document.createElement('div');
  var elementDetailBlockContentFolders  = document.createElement('div');
  var elementDetailBlockRenameButton    = document.createElement('button');
  var elementDetailBlockRemoveButton    = document.createElement('button');

  elementDetailBlock                .setAttribute('id', 'elementDetailBlock');
  elementDetailBlock                .setAttribute('name', folderUuid);
  
  elementDetailBlock                .setAttribute('class', 'elementDetailBlock');
  elementDetailBlockClose           .setAttribute('class', 'elementDetailBlockClose');
  elementDetailBlockTitle           .setAttribute('class', 'elementDetailBlockTitle');
  elementDetailBlockSpinner         .setAttribute('class', 'elementDetailBlockSpinner');
  elementDetailBlockNameLabel       .setAttribute('class', 'elementDetailBlockLabel');
  elementDetailBlockNameValue       .setAttribute('class', 'elementDetailBlockValue');
  elementDetailBlockContentLabel    .setAttribute('class', 'elementDetailBlockLabel');
  elementDetailBlockContentFiles    .setAttribute('class', 'elementDetailBlockValue');
  elementDetailBlockContentFolders  .setAttribute('class', 'elementDetailBlockValue');
  elementDetailBlockRemoveButton    .setAttribute('class', 'elementDetailBlockRemove');

  elementDetailBlockRenameButton    .addEventListener('click', () => { renameFolder(folderUuid, document.getElementById(folderUuid).innerText); });

  elementDetailBlockSpinner         .innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
  elementDetailBlockClose           .innerHTML = '<i class="fas fa-arrow-right"></i>';

  elementDetailBlockClose           .addEventListener('click', closeDetailBlock);

  elementDetailBlock                .appendChild(elementDetailBlockClose);
  elementDetailBlock                .appendChild(elementDetailBlockSpinner);

  $(elementDetailBlock).hide().appendTo(document.getElementById('mainBlock'));

  $(elementDetailBlock).toggle('slide', { direction: 'right' }, 200);

  $.ajax(
  {
    method: 'GET',
    dataType: 'json',
    timeout: 5000,
    url: '/queries/storage/strings',

    error: (xhr, textStatus, errorThrown) =>
    {
      closeDetailBlock();

      document.getElementById(folderUuid).removeAttribute('style');

      xhr.responseJSON != undefined
      ? displayErrorMessage(xhr.responseJSON.message, xhr.responseJSON.detail)
      : displayErrorMessage('Une erreur est survenue, veuillez réessayer plus tard', null);
    }

  }).done((json) =>
  {
    const strings = json.strings;

    $.ajax(
    {
      method: 'PUT',
      dataType: 'json',
      timeout: 5000,
      data: { serviceUuid: document.getElementById('mainBlock').getAttribute('name') },
      url: '/queries/storage/services/get-rights-for-service',
  
      error: (xhr, textStatus, errorThrown) =>
      {
        closeDetailBlock();

        document.getElementById(folderUuid).removeAttribute('style');

        xhr.responseJSON != undefined
        ? displayErrorMessage(xhr.responseJSON.message, xhr.responseJSON.detail)
        : displayErrorMessage('Une erreur est survenue, veuillez réessayer plus tard', null);
      }
  
    }).done((json) =>
    {
      const rights = json.rights;

      $.ajax(
      {
        method: 'PUT',
        dataType: 'json',
        data: { folderUuid: folderUuid, serviceUuid: document.getElementById('mainBlock').getAttribute('name') },
        timeout: 5000,
        url: '/queries/storage/services/get-folder-content',
    
        error: (xhr, textStatus, errorThrown) =>
        {
          closeDetailBlock();
    
          xhr.responseJSON != undefined
          ? displayErrorMessage(xhr.responseJSON.message, xhr.responseJSON.detail)
          : displayErrorMessage('Une erreur est survenue, veuillez réessayer plus tard', null);
        }
    
      }).done((json) =>
      {
        elementDetailBlockSpinner.remove();
  
        elementDetailBlockTitle           .innerText = strings.services.folderDetail.title;
        elementDetailBlockNameLabel       .innerText = strings.services.folderDetail.folderName;
        elementDetailBlockNameValue       .innerText = document.getElementById(folderUuid).innerText;
        elementDetailBlockContentLabel    .innerText = strings.services.folderDetail.folderContent;
        elementDetailBlockContentFiles    .innerText = `- ${json.result.files.length} ${strings.services.folderDetail.files}`;
        elementDetailBlockContentFolders  .innerText = `- ${json.result.folders.length} ${strings.services.folderDetail.folders}`;
        elementDetailBlockRenameButton    .innerText = strings.services.folderDetail.renameButton.label;
        elementDetailBlockRemoveButton    .innerText = strings.services.folderDetail.removeButton.label;

        rights.renameFolders
        ? elementDetailBlockRenameButton.setAttribute('class', 'elementDetailBlockRename')
        : elementDetailBlockRenameButton.setAttribute('class', 'elementDetailBlockRenameOff');

        rights.renameFolders
        ? elementDetailBlockRenameButton.setAttribute('title', strings.services.folderDetail.renameButton.titles.true)
        : elementDetailBlockRenameButton.setAttribute('title', strings.services.folderDetail.renameButton.titles.false);
  
        rights.removeFolders
        ? elementDetailBlockRemoveButton.setAttribute('title', strings.services.folderDetail.removeButton.titles.true)
        : elementDetailBlockRemoveButton.setAttribute('title', strings.services.folderDetail.removeButton.titles.false);
    
        elementDetailBlock                .appendChild(elementDetailBlockTitle);
        elementDetailBlock                .appendChild(elementDetailBlockNameLabel);
        elementDetailBlock                .appendChild(elementDetailBlockNameValue);
        elementDetailBlock                .appendChild(elementDetailBlockContentLabel);
        elementDetailBlock                .appendChild(elementDetailBlockContentFiles);
        elementDetailBlock                .appendChild(elementDetailBlockContentFolders);
        elementDetailBlock                .appendChild(elementDetailBlockRenameButton);
        elementDetailBlock                .appendChild(elementDetailBlockRemoveButton);
      });
    });
  });
}

/****************************************************************************************************/

function closeDetailBlock()
{
  if(document.getElementById('elementDetailBlock'))
  {
    document.getElementById(document.getElementById('elementDetailBlock').getAttribute('name')).removeAttribute('style');

    $(document.getElementById('elementDetailBlock')).toggle('slide', { direction: 'right' }, 200, () => { if(document.getElementById('elementDetailBlock')) document.getElementById('elementDetailBlock').remove(); });
  }
}

/****************************************************************************************************/

function switchEventsPage(event)
{
  const pageTag     = parseInt(event.target.getAttribute('tag'));
  var events        = document.getElementById('elementDetailBlockEventsContent').children;

  document.getElementById('elementDetailBlockEventsPages').innerHTML = '';

  var startPage = null, endPage = null;

  startPage = (pageTag - 4) > 0 ? (pageTag - 4) : 0;
  endPage = Math.ceil(events.length / 8) > (startPage + 7) ? (startPage + 7) : Math.ceil(events.length / 8);

  event.target.removeEventListener('click', switchEventsPage);

  for(var x = startPage; x < endPage; x++)
  {
    var pageSelector = document.createElement('div');

    pageSelector.innerText = (x + 1);

    x === pageTag
    ? pageSelector.setAttribute('class', 'elementDetailBlockEventsPagesElementSelected')
    : pageSelector.setAttribute('class', 'elementDetailBlockEventsPagesElement');

    if(x !== pageTag) pageSelector.addEventListener('click', switchEventsPage);

    pageSelector.setAttribute('tag', x);

    document.getElementById('elementDetailBlockEventsPages').appendChild(pageSelector);
  }

  for(var x = 0; x < events.length; x++)
  {
    events[x].getAttribute('tag') == pageTag
    ? events[x].removeAttribute('style')
    : events[x].style.display = 'none';
  }
}

/****************************************************************************************************/