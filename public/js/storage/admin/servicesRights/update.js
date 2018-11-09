/****************************************************************************************************/

if(document.getElementById('accountsList'))
{
  const accountRows = document.getElementById('accountsList').children;

  for(var x = 0; x < accountRows.length; x++)
  {
    const accountUuid = accountRows[x].getAttribute('name');
    accountRows[x].addEventListener('click', () => { prepareUpdatePopup(accountUuid) });
  }
}

/****************************************************************************************************/

function prepareUpdatePopup(accountUuid)
{
  if(document.getElementById('updateAccountServiceLevelBackground')) return;

  createBackground('updateAccountServiceLevelBackground');

  displayLoader('', (loader) =>
  {
    getStorageAppStrings((error, strings) =>
    {
      if(error != null)
      {
        removeBackground('updateAccountServiceLevelBackground');

        displayError(error.message, error.detail, null);

        return;
      }

      getAccountServiceRights(accountUuid, strings, loader);
    });
  });
}

/****************************************************************************************************/

function getAccountServiceRights(accountUuid, strings, loader)
{
  $.ajax(
  {
    type: 'PUT', timeout: 10000, dataType: 'JSON', data: { accountUuid: accountUuid, serviceUuid: document.getElementById('serviceUuid').getAttribute('name') }, url: '/queries/storage/services/get-account-rights-for-service', success: () => {},
    error: (xhr, status, error) =>
    {
      removeLoader(loader, () =>
      {
        removeBackground('updateAccountServiceLevelBackground');

        xhr.responseJSON != undefined
        ? displayError(xhr.responseJSON.message, xhr.responseJSON.detail, null)
        : displayError('Une erreur est survenue, veuillez réessayer plus tard', null, null);
      });
    }
                        
  }).done((result) =>
  {
    removeLoader(loader, () =>
    {
      openUpdatePopup(accountUuid, strings, result);
    });
  });
}

/****************************************************************************************************/

function openUpdatePopup(accountUuid, strings, result)
{
  var popup     = document.createElement('div');
  var rights    = document.createElement('div');
  var buttons   = document.createElement('div');
  var confirm   = document.createElement('button');
  var cancel    = document.createElement('button');

  popup         .setAttribute('class', 'updateServiceRightsPopup');
  rights        .setAttribute('class', 'updateServiceRightsPopupRights');
  buttons       .setAttribute('class', 'updateServiceRightsPopupButtons');
  confirm       .setAttribute('class', 'updateServiceRightsPopupConfirm');
  cancel        .setAttribute('class', 'updateServiceRightsPopupCancel');

  popup         .setAttribute('id', 'updateServiceRightsPopup');

  popup         .innerHTML += `<div class="updateServiceRightsPopupTitle">${strings.admin.serviceRights.service.serviceRightsUpdatePopup.title}</div>`;
  
  result.requestedAccountServiceRights.isAdmin
  ? popup       .innerHTML += `<div class="updateServiceRightsPopupAdminBlock"><div class="updateServiceRightsPopupRightBlock"><div class="updateServiceRightsPopupRightName">${strings.admin.serviceRights.service.serviceRightsUpdatePopup.rightsLabels.isAdmin}</div><div class="updateServiceRightsPopupRightInput"><input type="checkbox" id="isAdmin" class="input"><label class="label" for="isAdmin">${strings.admin.serviceRights.service.serviceRightsUpdatePopup.hasRight}</label></div></div></div>`
  : popup       .innerHTML += `<div class="updateServiceRightsPopupAdminBlock"><div class="updateServiceRightsPopupRightBlock"><div class="updateServiceRightsPopupRightName">${strings.admin.serviceRights.service.serviceRightsUpdatePopup.rightsLabels.isAdmin}</div><div class="updateServiceRightsPopupRightInput"><input type="checkbox" id="isAdmin" class="input"><label class="label" for="isAdmin">${strings.admin.serviceRights.service.serviceRightsUpdatePopup.doesNotHaveRight}</label></div></div></div>`;

  for(var right in result.requestedAccountServiceRights)
  {
    if(right !== 'isAdmin')
    {
      result.requestedAccountServiceRights[right]
      ? rights.innerHTML += `<div class="updateServiceRightsPopupRightBlock"><div class="updateServiceRightsPopupRightName">${strings.admin.serviceRights.service.serviceRightsUpdatePopup.rightsLabels[right]}</div><div class="updateServiceRightsPopupRightInput"><input type="checkbox" id="${right}" class="input"><label class="label" for="${right}">${strings.admin.serviceRights.service.serviceRightsUpdatePopup.hasRight}</label></div></div>`
      : rights.innerHTML += `<div class="updateServiceRightsPopupRightBlock"><div class="updateServiceRightsPopupRightName">${strings.admin.serviceRights.service.serviceRightsUpdatePopup.rightsLabels[right]}</div><div class="updateServiceRightsPopupRightInput"><input type="checkbox" id="${right}" class="input"><label class="label" for="${right}">${strings.admin.serviceRights.service.serviceRightsUpdatePopup.doesNotHaveRight}</label></div></div>`;
    }
  }

  confirm       .addEventListener('click', () =>
  {
    popup.style.display = 'none';
    openConfirmationPopup(accountUuid, strings);
  });

  cancel        .addEventListener('click', () =>
  {
    popup.remove();
    removeBackground('updateAccountServiceLevelBackground');
  });

  confirm       .innerText = strings.admin.serviceRights.service.serviceRightsUpdatePopup.confirm;
  cancel        .innerText = strings.admin.serviceRights.service.serviceRightsUpdatePopup.cancel;

  buttons       .appendChild(confirm);
  buttons       .appendChild(cancel);
  popup         .appendChild(rights);
  popup         .appendChild(buttons);

  document.body .appendChild(popup);
}

/****************************************************************************************************/

function openConfirmationPopup(accountUuid, strings)
{
  var popup     = document.createElement('div');
  var buttons   = document.createElement('div');
  var confirm   = document.createElement('button');
  var cancel    = document.createElement('button');

  popup         .setAttribute('class', 'standardPopup');
  buttons       .setAttribute('class', 'standardPopupButtons');
  confirm       .setAttribute('class', 'standardPopupConfirm');
  cancel        .setAttribute('class', 'standardPopupCancel');

  popup         .setAttribute('id', 'updateServiceRightsConfirmationPopup');

  confirm       .innerText = strings.admin.serviceRights.service.serviceRightsUpdatePopup.confirm;
  cancel        .innerText = strings.admin.serviceRights.service.serviceRightsUpdatePopup.cancel;

  popup         .innerHTML += `<div class="standardPopupTitle">${strings.admin.serviceRights.service.serviceRightsUpdatePopup.confirmationTitle}</div>`;
  popup         .innerHTML += `<div class="standardPopupMessage">${strings.admin.serviceRights.service.serviceRightsUpdatePopup.confirmationMessage}</div>`;

  confirm       .addEventListener('click', () =>
  {
    sendDataToServer(accountUuid, strings);
  });

  cancel        .addEventListener('click', () =>
  {
    popup.remove();
    document.getElementById('updateServiceRightsPopup').removeAttribute('style');
  });

  buttons       .appendChild(confirm);
  buttons       .appendChild(cancel);
  popup         .appendChild(buttons);
  document.body .appendChild(popup);
}

/****************************************************************************************************/

function sendDataToServer(accountUuid, strings)
{
  if(document.getElementById('isAdmin') == null) return;
  if(document.getElementById('moveFiles') == null) return;
  if(document.getElementById('uploadFiles') == null) return;
  if(document.getElementById('removeFiles') == null) return;
  if(document.getElementById('postComments') == null) return;
  if(document.getElementById('restoreFiles') == null) return;
  if(document.getElementById('accessService') == null) return;
  if(document.getElementById('createFolders') == null) return;
  if(document.getElementById('downloadFiles') == null) return;
  if(document.getElementById('renameFolders') == null) return;
  if(document.getElementById('removeFolders') == null) return;

  document.getElementById('updateServiceRightsConfirmationPopup').remove();

  var rights = {};

  rights.isAdmin        = document.getElementById('isAdmin').checked;
  rights.moveFiles      = document.getElementById('moveFiles').checked;
  rights.uploadFiles    = document.getElementById('uploadFiles').checked;
  rights.removeFiles    = document.getElementById('removeFiles').checked;
  rights.postComments   = document.getElementById('postComments').checked;
  rights.restoreFiles   = document.getElementById('restoreFiles').checked;
  rights.accessService  = document.getElementById('accessService').checked;
  rights.createFolders  = document.getElementById('createFolders').checked;
  rights.downloadFiles  = document.getElementById('downloadFiles').checked;
  rights.renameFolders  = document.getElementById('renameFolders').checked;
  rights.removeFolders  = document.getElementById('removeFolders').checked;

  displayLoader(strings.admin.serviceRights.service.serviceRightsUpdatePopup.loaderMessage, (loader) =>
  {
    $.ajax(
    {
      type: 'PUT', timeout: 10000, dataType: 'JSON', data: { accountUuid: accountUuid, serviceUuid: document.getElementById('serviceUuid').getAttribute('name'), serviceRights: JSON.stringify(rights) }, url: '/queries/storage/admin/update-account-service-rights', success: () => {},
      error: (xhr, status, error) =>
      {
        removeLoader(loader, () =>
        {
          document.getElementById('updateServiceRightsPopup').removeAttribute('style');

          xhr.responseJSON != undefined
          ? displayError(xhr.responseJSON.message, xhr.responseJSON.detail, null)
          : displayError('Une erreur est survenue, veuillez réessayer plus tard', null, null);
        });
      }
                          
    }).done((result) =>
    {
      removeLoader(loader, () =>
      {
        document.getElementById('updateServiceRightsPopup').remove();
        removeBackground('updateAccountServiceLevelBackground');

        displaySuccess(result.message, null);
      });
    });
  });
}

/****************************************************************************************************/