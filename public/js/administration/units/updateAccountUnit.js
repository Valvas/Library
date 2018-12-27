/****************************************************************************************************/

var administrationAppStrings = null;

/****************************************************************************************************/

function updateAccountUnit()
{
  const currentSelect = event.target;

  createBackground('updateAccountUnitBackground');

  if(administrationAppStrings != null) return updateAccountUnitOpenPopup(currentSelect);

  return updateAccountUnitGetStrings(currentSelect);
}

/****************************************************************************************************/

function updateAccountUnitGetStrings(currentSelect)
{
  displayLoader('', (loader) =>
  {
    getAdministrationAppStrings((error, strings) =>
    {
      removeLoader(loader, () => {  });

      if(error != null)
      {
        removeBackground('updateAccountUnitBackground');
        
        return displayError(error.message, error.detail, 'updateAccountUnitError');
      }

      administrationAppStrings = strings;

      return updateAccountUnitOpenPopup(currentSelect);
    });
  });
}

/****************************************************************************************************/

function updateAccountUnitOpenPopup(currentSelect)
{
  var message = administrationAppStrings.unitsManage.updateAccountUnitPopup.message.replace('[$1$]', `<b>${currentSelect.options[currentSelect.selectedIndex].text}</b>`);

  var popup   = document.createElement('div');
  var buttons = document.createElement('div');
  var confirm = document.createElement('button');
  var cancel  = document.createElement('button');

  popup       .setAttribute('id', 'updateAccountUnitPopup');

  popup       .setAttribute('class', 'standardPopup');
  buttons     .setAttribute('class', 'unitsPopupButtons');
  confirm     .setAttribute('class', 'unitsPopupButtonsConfirm');
  cancel      .setAttribute('class', 'unitsPopupButtonsCancel');

  popup       .innerHTML += `<div class="standardPopupTitle">${administrationAppStrings.unitsManage.updateAccountUnitPopup.title}</div>`;
  popup       .innerHTML += `<div class="standardPopupMessage">${message}</div>`;

  confirm     .innerText = administrationAppStrings.unitsManage.updateAccountUnitPopup.confirm;
  cancel      .innerText = administrationAppStrings.unitsManage.updateAccountUnitPopup.cancel;

  confirm     .addEventListener('click', () =>
  {
    popup.remove();
    updateAccountUniSendToServer(currentSelect);
  });

  cancel      .addEventListener('click', () =>
  {
    popup.remove();
    removeBackground('updateAccountUnitBackground');
    currentSelect.value = currentSelect.getAttribute('name');
  });

  buttons     .appendChild(confirm);
  buttons     .appendChild(cancel);
  popup       .appendChild(buttons);

  document.body.appendChild(popup);
}

/****************************************************************************************************/

function updateAccountUniSendToServer(currentSelect)
{
  displayLoader(administrationAppStrings.unitsManage.updateAccountUnitPopup.loader, (loader) =>
  {
    $.ajax(
    {
      method: 'PUT', dataType: 'json', timeout: 10000, data: { accountUuid: currentSelect.parentNode.getAttribute('id'), newUnitId: currentSelect.value }, url: '/queries/administration/units/update-account-unit',

      error: (xhr, textStatus, errorThrown) =>
      {
        removeLoader(loader, () => {  });

        removeBackground('updateAccountUnitBackground');

        xhr.responseJSON != undefined
        ? displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'updateAccountUnitError')
        : displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'updateAccountUnitError');
      }

    }).done((result) =>
    {
      removeLoader(loader, () => {  });

      removeBackground('updateAccountUnitBackground');

      displaySuccess(result.message, null, 'updateAccountUnitSuccess');

      currentSelect.setAttribute('name', currentSelect.value);
    });
  });
}

/****************************************************************************************************/