/****************************************************************************************************/

var administrationAppStrings = null;

const updateAdminStatusCheckboxes = document.getElementsByName('adminCheckbox');

for(var x = 0; x < updateAdminStatusCheckboxes.length; x++)
{
  updateAdminStatusCheckboxes[x].addEventListener('change', launchAdminAccountProcess);
}

/****************************************************************************************************/

function launchAdminAccountProcess(event)
{
  if(document.getElementById('adminAccountBackground')) return;

  createBackground('adminAccountBackground');

  displayLoader('', (loader) =>
  {
    if(administrationAppStrings != null) return openAdminAccountConfirmationPopup(event.target.parentNode.parentNode.getAttribute('id'), event.target, loader);

    getAdministrationAppStrings((error, strings) =>
    {
      if(error != null)
      {
        removeBackground('adminAccountBackground');
        
        return displayError(error.message, error.detail, 'adminAccountError');
      }

      administrationAppStrings = strings;

      return openAdminAccountConfirmationPopup(event.target.parentNode.parentNode.getAttribute('id'), event.target, loader);
    });
  });
}

/****************************************************************************************************/

function openAdminAccountConfirmationPopup(accountUuid, checkbox, loader)
{
  var popup   = document.createElement('div');
  var buttons = document.createElement('div');
  var confirm = document.createElement('button');
  var cancel  = document.createElement('button');

  popup       .setAttribute('id', 'adminAccountPopup');

  popup       .setAttribute('class', 'confirmationAccountPopup');
  buttons     .setAttribute('class', 'confirmationAccountPopupButtons');
  confirm     .setAttribute('class', 'confirmationAccountPopupSave');
  cancel      .setAttribute('class', 'confirmationAccountPopupCancel');

  popup       .innerHTML += `<div class="confirmationAccountPopupTitle">${administrationAppStrings.accountsHome.updateAccountAdminStatusPopup.title}</div>`;

  checkbox.checked
  ? popup     .innerHTML += `<div class="confirmationAccountPopupMessage">${administrationAppStrings.accountsHome.updateAccountAdminStatusPopup.setAdminMessage}</div>`
  : popup     .innerHTML += `<div class="confirmationAccountPopupMessage">${administrationAppStrings.accountsHome.updateAccountAdminStatusPopup.unsetAdminMessage}</div>`;

  checkbox.checked
  ? confirm   .innerText = administrationAppStrings.accountsHome.updateAccountAdminStatusPopup.setAdminConfirm
  : confirm   .innerText = administrationAppStrings.accountsHome.updateAccountAdminStatusPopup.unsetAdminConfirm;

  cancel      .innerText = administrationAppStrings.accountsHome.updateAccountAdminStatusPopup.cancel;

  confirm     .addEventListener('click', () =>
  {
    sendAdminRequestToServer(accountUuid, checkbox.checked, checkbox);
  });

  cancel      .addEventListener('click', () =>
  {
    checkbox.checked
    ? checkbox.checked = false
    : checkbox.checked = true;

    popup.remove();
    removeBackground('adminAccountBackground');
  });

  buttons     .appendChild(confirm);
  buttons     .appendChild(cancel);
  popup       .appendChild(buttons);

  document.body.appendChild(popup);

  removeLoader(loader, () => {  });
}

/****************************************************************************************************/

function sendAdminRequestToServer(accountUuid, isToBeAdmin, checkbox)
{
  if(document.getElementById('adminAccountPopup')) document.getElementById('adminAccountPopup').remove();

  displayLoader(isToBeAdmin ? administrationAppStrings.accountsHome.setAdminAccountSavingMessage : administrationAppStrings.accountsHome.unsetAdminAccountSavingMessage, (loader) =>
  {
    $.ajax(
    {
      method: 'PUT', dataType: 'json', timeout: 10000, data: { accountUuid: accountUuid, isToBeAdmin: isToBeAdmin }, url: '/queries/administration/accounts/update-account-admin-status',

      error: (xhr, textStatus, errorThrown) =>
      {
        removeLoader(loader, () => {  });

        removeBackground('adminAccountBackground');

        checkbox.checked
        ? checkbox.checked = false
        : checkbox.checked = true;

        xhr.responseJSON != undefined
        ? displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'adminAccountError')
        : displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'adminAccountError');
      }

    }).done((result) =>
    {
      removeLoader(loader, () => {  });

      removeBackground('adminAccountBackground');

      displaySuccess(result.message, null, 'adminAccountSuccess');
    });
  });
}

/****************************************************************************************************/