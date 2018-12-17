/****************************************************************************************************/

var storageAppStrings = null;

function addEventListenersOnFilesForDetail()
{
  const currentFiles = document.getElementById('filesContainer').children;

  for(var x = 0; x < currentFiles.length; x++)
  {
    const currentFile = currentFiles[x];

    currentFile.addEventListener('contextmenu', openFileDetail);

    currentFile.addEventListener('click', (event) =>
    {
      if(currentFile.children[0].tagName === 'INPUT')
      {
        if(event.target.tagName === 'INPUT') return updateSelectedFiles(currentFile.children[0]);

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
    method: 'PUT', dataType: 'json', timeout: 10000, data: { serviceUuid: document.getElementById('serviceUuid').getAttribute('name'), fileUuid: target.getAttribute('name') }, url: '/queries/storage/services/get-file-logs',

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

      case 3:
        var showEditButton = result.isAppAdmin || result.accountRightsOnService.isAdmin || result.accountRightsOnService.editAllCommentsOnFile || ((result.fileLogs[x].account === result.accountData.uuid) && result.accountRightsOnService.editOwnCommentsOnFile);
        var showDeleteButton = result.isAppAdmin || result.accountRightsOnService.isAdmin || result.accountRightsOnService.removeAllCommentsOnFile || ((result.fileLogs[x].account === result.accountData.uuid) && result.accountRightsOnService.removeOwnCommentsOnFile);

        (showEditButton && showDeleteButton)
        ? list.innerHTML += `<div name="${result.fileLogs[x].uuid}" class="fileLogComment"><div>${result.fileLogs[x].date}</div><div>${result.fileLogs[x].message}</div><div class="fileLogCommentContent">${result.fileLogs[x].comment}</div><div class="fileLogCommentButtons"><div onclick="updateCommentGetStrings('${result.fileLogs[x].uuid}')" class="fileLogCommentButtonsEdit">${storageAppStrings.services.detailPage.fileAsideLogs.editComment}</div><div onclick="removeCommentGetStrings('${result.fileLogs[x].uuid}')" class="fileLogCommentButtonsDelete">${storageAppStrings.services.detailPage.fileAsideLogs.removeComment}</div></div></div>`
        : showEditButton
          ? list.innerHTML += `<div name="${result.fileLogs[x].uuid}" class="fileLogComment"><div>${result.fileLogs[x].date}</div><div>${result.fileLogs[x].message}</div><div class="fileLogCommentContent">${result.fileLogs[x].comment}</div><div class="fileLogCommentButtons"><div onclick="updateCommentGetStrings('${result.fileLogs[x].uuid}')" class="fileLogCommentButtonsEdit">${storageAppStrings.services.detailPage.fileAsideLogs.editComment}</div></div></div>`
          : showDeleteButton
            ? list.innerHTML += `<div name="${result.fileLogs[x].uuid}" class="fileLogComment"><div>${result.fileLogs[x].date}</div><div>${result.fileLogs[x].message}</div><div class="fileLogCommentContent">${result.fileLogs[x].comment}</div><div class="fileLogCommentButtons"><div onclick="removeCommentGetStrings('${result.fileLogs[x].uuid}')" class="fileLogCommentButtonsDelete">${storageAppStrings.services.detailPage.fileAsideLogs.removeComment}</div></div></div>`
            : list.innerHTML += `<div name="${result.fileLogs[x].uuid}" class="fileLogComment"><div>${result.fileLogs[x].date}</div><div>${result.fileLogs[x].message}</div><div class="fileLogCommentContent">${result.fileLogs[x].comment}</div></div>`;
      break;

      case 4:
        list.innerHTML += `<div name="${result.fileLogs[x].uuid}" class="fileLogComment"><div>${result.fileLogs[x].date}</div><div>${result.fileLogs[x].message}</div><div class="fileLogCommentRemoved">${storageAppStrings.services.fileDetail.logs.removedCommentMessage}</div></div>`;
      break;
    }
  }

  logs.appendChild(list);

  document.getElementById('fileDetailAside').appendChild(logs);

  document.getElementById('fileDetailAside').insertBefore(close, document.getElementById('fileDetailAside').children[0]);
}

/****************************************************************************************************/