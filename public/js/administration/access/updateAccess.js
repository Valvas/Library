/****************************************************************************************************/

var administrationAppStrings = null;

const apps = document.getElementsByName('appBlock');

for(var x = 0; x < apps.length; x++)
{
  apps[x].children[1].children[0].addEventListener('change', launchUpdateAccessProccess);
}

/****************************************************************************************************/

function launchUpdateAccessProccess(event)
{
  if(document.getElementById('updateAccessBackground')) return;

  createBackground('updateAccessBackground');

  displayLoader('', (loader) =>
  {
    if(administrationAppStrings != null) return openUpdateAccessConfirmationPopup(event.target.parentNode.parentNode.getAttribute('id'), event.target, loader);

    getAdministrationAppStrings((error, strings) =>
    {
      if(error != null)
      {
        removeBackground('updateAccessBackground');
        
        return displayError(error.message, error.detail, 'updateAccessError');
      }

      administrationAppStrings = strings;

      return openUpdateAccessConfirmationPopup(event.target.parentNode.parentNode.getAttribute('id'), event.target, loader);
    });
  });
}

/****************************************************************************************************/

function openUpdateAccessConfirmationPopup(appName, checkbox, loader)
{
  var popup   = document.createElement('div');
  var buttons = document.createElement('div');
  var confirm = document.createElement('button');
  var cancel  = document.createElement('button');

  popup       .setAttribute('id', 'updateAccessPopup');

  popup       .setAttribute('class', 'confirmationAccountPopup');
  buttons     .setAttribute('class', 'confirmationAccountPopupButtons');
  confirm     .setAttribute('class', 'confirmationAccountPopupSave');
  cancel      .setAttribute('class', 'confirmationAccountPopupCancel');

  popup       .innerHTML += `<div class="confirmationAccountPopupTitle">${administrationAppStrings.accessDetail.updateAccessPopup.title}</div>`;

  checkbox.checked
  ? popup     .innerHTML += `<div class="confirmationAccountPopupMessage">${administrationAppStrings.accessDetail.updateAccessPopup.addAccessMessage}</div>`
  : popup     .innerHTML += `<div class="confirmationAccountPopupMessage">${administrationAppStrings.accessDetail.updateAccessPopup.removeAccessMessage}</div>`;

  checkbox.checked
  ? confirm   .innerText = administrationAppStrings.accessDetail.updateAccessPopup.addAccessConfirm
  : confirm   .innerText = administrationAppStrings.accessDetail.updateAccessPopup.removeAccessConfirm;

  cancel      .innerText = administrationAppStrings.accessDetail.updateAccessPopup.cancel;

  confirm     .addEventListener('click', () =>
  {
    checkbox.checked
    ? addAccessToAccount(appName, checkbox)
    : removeAccessToAccount(appName, checkbox);
  });

  cancel      .addEventListener('click', () =>
  {
    checkbox.checked
    ? checkbox.checked = false
    : checkbox.checked = true;

    popup.remove();
    removeBackground('updateAccessBackground');
  });

  buttons     .appendChild(confirm);
  buttons     .appendChild(cancel);
  popup       .appendChild(buttons);

  document.body.appendChild(popup);

  removeLoader(loader, () => {  });
}

/****************************************************************************************************/

function addAccessToAccount(appName, checkbox)
{
  if(document.getElementById('updateAccessPopup')) document.getElementById('updateAccessPopup').remove();

  displayLoader(administrationAppStrings.accessDetail.addAccessSavingMessage, (loader) =>
  {
    $.ajax(
    {
      method: 'PUT', dataType: 'json', timeout: 10000, data: { accountUuid: document.getElementById('accountUuid').getAttribute('name'), appName: appName }, url: '/queries/administration/access/add-access-to-app',

      error: (xhr, textStatus, errorThrown) =>
      {
        removeLoader(loader, () => {  });

        removeBackground('updateAccessBackground');

        checkbox.checked
        ? checkbox.checked = false
        : checkbox.checked = true;

        xhr.responseJSON != undefined
        ? displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'updateAccessError')
        : displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'updateAccessError');
      }

    }).done((result) =>
    {
      removeLoader(loader, () => {  });

      removeBackground('updateAccessBackground');

      displaySuccess(result.message, null, 'updateAccessSuccess');
    });
  });
}

/****************************************************************************************************/

function removeAccessToAccount(appName, checkbox)
{
  if(document.getElementById('updateAccessPopup')) document.getElementById('updateAccessPopup').remove();

  displayLoader(administrationAppStrings.accessDetail.removeAccessSavingMessage, (loader) =>
  {
    $.ajax(
    {
      method: 'PUT', dataType: 'json', timeout: 10000, data: { accountUuid: document.getElementById('accountUuid').getAttribute('name'), appName: appName }, url: '/queries/administration/access/remove-access-to-app',

      error: (xhr, textStatus, errorThrown) =>
      {
        removeLoader(loader, () => {  });

        removeBackground('updateAccessBackground');

        checkbox.checked
        ? checkbox.checked = false
        : checkbox.checked = true;

        xhr.responseJSON != undefined
        ? displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'updateAccessError')
        : displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'updateAccessError');
      }

    }).done((result) =>
    {
      removeLoader(loader, () => {  });

      removeBackground('updateAccessBackground');

      displaySuccess(result.message, null, 'updateAccessSuccess');
    });
  });
}

/****************************************************************************************************/