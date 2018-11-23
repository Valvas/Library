/****************************************************************************************************/

var administrationAppStrings = null;

const checkboxes = document.getElementsByName('suspendCheckbox');

for(var x = 0; x < checkboxes.length; x++)
{
  checkboxes[x].addEventListener('change', launchSuspendAccountProcess);
}

/****************************************************************************************************/

function launchSuspendAccountProcess(event)
{
  if(document.getElementById('suspendAccountBackground')) return;

  createBackground('suspendAccountBackground');

  displayLoader('', (loader) =>
  {
    if(administrationAppStrings != null) return openSuspendAccountConfirmationPopup(event.target.parentNode.parentNode.getAttribute('id'), event.target, loader);

    getAdministrationAppStrings((error, strings) =>
    {
      if(error != null)
      {
        removeBackground('suspendAccountBackground');
        
        return displayError(error.message, error.detail, 'suspendAccountError');
      }

      administrationAppStrings = strings;

      return openSuspendAccountConfirmationPopup(event.target.parentNode.parentNode.getAttribute('id'), event.target, loader);
    });
  });
}

/****************************************************************************************************/

function openSuspendAccountConfirmationPopup(accountUuid, checkbox, loader)
{
  var popup   = document.createElement('div');
  var buttons = document.createElement('div');
  var confirm = document.createElement('button');
  var cancel  = document.createElement('button');

  popup       .setAttribute('id', 'suspendAccountPopup');

  popup       .setAttribute('class', 'confirmationAccountPopup');
  buttons     .setAttribute('class', 'confirmationAccountPopupButtons');
  confirm     .setAttribute('class', 'confirmationAccountPopupSave');
  cancel      .setAttribute('class', 'confirmationAccountPopupCancel');

  popup       .innerHTML += `<div class="confirmationAccountPopupTitle">${administrationAppStrings.accountsHome.suspendAccountPopup.title}</div>`;

  checkbox.checked
  ? popup     .innerHTML += `<div class="confirmationAccountPopupMessage">${administrationAppStrings.accountsHome.suspendAccountPopup.suspendMessage}</div>`
  : popup     .innerHTML += `<div class="confirmationAccountPopupMessage">${administrationAppStrings.accountsHome.suspendAccountPopup.unSuspendMessage}</div>`;

  checkbox.checked
  ? confirm   .innerText = administrationAppStrings.accountsHome.suspendAccountPopup.suspendConfirm
  : confirm   .innerText = administrationAppStrings.accountsHome.suspendAccountPopup.unSuspendConfirm;

  cancel      .innerText = administrationAppStrings.accountsHome.suspendAccountPopup.cancel;

  confirm     .addEventListener('click', () =>
  {
    sendSuspensionRequestToServer(accountUuid, checkbox.checked, checkbox);
  });

  cancel      .addEventListener('click', () =>
  {
    checkbox.checked
    ? checkbox.checked = false
    : checkbox.checked = true;

    popup.remove();
    removeBackground('suspendAccountBackground');
  });

  buttons     .appendChild(confirm);
  buttons     .appendChild(cancel);
  popup       .appendChild(buttons);

  document.body.appendChild(popup);

  removeLoader(loader, () => {  });
}

/****************************************************************************************************/

function sendSuspensionRequestToServer(accountUuid, isToBeSuspended, checkbox)
{
  if(document.getElementById('suspendAccountPopup')) document.getElementById('suspendAccountPopup').remove();

  displayLoader(isToBeSuspended ? administrationAppStrings.accountsHome.suspendAccountSavingMessage : administrationAppStrings.accountsHome.unSuspendAccountSavingMessage, (loader) =>
  {
    $.ajax(
    {
      method: 'PUT', dataType: 'json', timeout: 10000, data: { accountUuid: accountUuid, isToBeSuspended: isToBeSuspended }, url: '/queries/administration/accounts/update-account-suspension-status',

      error: (xhr, textStatus, errorThrown) =>
      {
        removeLoader(loader, () => {  });

        removeBackground('suspendAccountBackground');

        checkbox.checked
        ? checkbox.checked = false
        : checkbox.checked = true;

        xhr.responseJSON != undefined
        ? displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'suspendAccountError')
        : displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'suspendAccountError');
      }

    }).done((result) =>
    {
      removeLoader(loader, () => {  });

      removeBackground('suspendAccountBackground');

      displaySuccess(result.message, null, 'suspendAccountSuccess');
    });
  });
}

/****************************************************************************************************/