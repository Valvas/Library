/****************************************************************************************************/

var storageAppStrings = null;

/****************************************************************************************************/

if(document.getElementById('accountsList'))
{
  const accounts = document.getElementById('accountsList').children;

  for(var x = 0; x < accounts.length; x++)
  {
    accounts[x].children[1].children[0].addEventListener('change', accountChecked);
  }
}

/****************************************************************************************************/

function accountChecked(event)
{
  if(document.getElementById('updateAccountAdminStatusBackground')) return;

  createBackground('updateAccountAdminStatusBackground');

  if(storageAppStrings != null) return openConfirmationPopup(storageAppStrings, event.target);

  displayLoader('', (loader) =>
  {
    getStorageAppStrings((error, strings) =>
    {
      removeLoader(loader, () => {  });

      if(error == null) return openConfirmationPopup(strings, event.target);

      removeBackground('updateAccountAdminStatusBackground');

      displayError(error.message, error.detail, 'updateAccountAdminStatusError');
    });
  });
}

/****************************************************************************************************/

function openConfirmationPopup(strings, checkbox)
{
  storageAppStrings = strings;

  checkbox.checked
  ? checkbox.parentNode.children[1].innerText = storageAppStrings.admin.accountsLevel.isAdmin
  : checkbox.parentNode.children[1].innerText = storageAppStrings.admin.accountsLevel.isNotAdmin;

  var popup     = document.createElement('div');
  var buttons   = document.createElement('div');
  var confirm   = document.createElement('button');
  var cancel    = document.createElement('button');

  popup         .setAttribute('class', 'standardPopup');
  buttons       .setAttribute('class', 'accountAdminStatusPopupButtons');
  confirm       .setAttribute('class', 'accountAdminStatusPopupConfirm');
  cancel        .setAttribute('class', 'accountAdminStatusPopupCancel');

  popup         .innerHTML += `<div class="standardPopupTitle">${storageAppStrings.admin.accountsLevel.confirmationPopup.title}</div>`;

  checkbox.checked
  ? popup       .innerHTML += `<div class="accountAdminStatusPopupMessage">${storageAppStrings.admin.accountsLevel.confirmationPopup.enabledMessage}</div>`
  : popup       .innerHTML += `<div class="accountAdminStatusPopupMessage">${storageAppStrings.admin.accountsLevel.confirmationPopup.disabledMessage}</div>`;

  confirm       .innerText = storageAppStrings.admin.accountsLevel.confirmationPopup.confirm;
  cancel        .innerText = storageAppStrings.admin.accountsLevel.confirmationPopup.cancel;

  confirm       .addEventListener('click', () =>
  {
    popup.remove();
    updateAccountAdminStatusServerSide(checkbox.getAttribute('id'), checkbox);
  });

  cancel        .addEventListener('click', () =>
  {
    popup.remove();
    
    checkbox.checked
    ? checkbox.checked = false
    : checkbox.checked = true;

    checkbox.checked
    ? checkbox.parentNode.children[1].innerText = storageAppStrings.admin.accountsLevel.isAdmin
    : checkbox.parentNode.children[1].innerText = storageAppStrings.admin.accountsLevel.isNotAdmin;

    removeBackground('updateAccountAdminStatusBackground');
  });

  buttons       .appendChild(confirm);
  buttons       .appendChild(cancel);
  popup         .appendChild(buttons);
  document.body .appendChild(popup);
}

/****************************************************************************************************/

function updateAccountAdminStatusServerSide(accountUuid, checkbox)
{
  displayLoader(storageAppStrings.admin.accountsLevel.confirmationPopup.sendingMessage, (loader) =>
  {
    $.ajax(
    {
      type: 'PUT', timeout: 5000, dataType: 'JSON', data: { accountUuid: accountUuid, isAdmin: checkbox.checked }, url: '/queries/storage/admin/update-admin-status', success: () => {},
      error: (xhr, status, error) =>
      {
        removeLoader(loader, () =>
        {
          checkbox.checked
          ? checkbox.checked = false
          : checkbox.checked = true;

          checkbox.checked
          ? checkbox.parentNode.children[1].innerText = storageAppStrings.admin.accountsLevel.isAdmin
          : checkbox.parentNode.children[1].innerText = storageAppStrings.admin.accountsLevel.isNotAdmin;

          removeBackground('updateAccountAdminStatusBackground');
  
          xhr.responseJSON != undefined
          ? displayError(xhr.responseJSON.message, xhr.responseJSON.detail, null)
          : displayError('Une erreur est survenue, veuillez réessayer plus tard', null, null);
        });
      }
                          
    }).done((result) =>
    {
      removeLoader(loader, () =>
      {
        removeBackground('updateAccountAdminStatusBackground');

        displaySuccess(result.message, null, null);
      });
    });
  });
}

/****************************************************************************************************/