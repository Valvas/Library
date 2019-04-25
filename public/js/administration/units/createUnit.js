/****************************************************************************************************/

let appStrings = null;

if(document.getElementById('createUnitForm'))
{
  document.getElementById('createUnitForm').addEventListener('submit', createUnit);
}

/****************************************************************************************************/

function createUnit(event)
{
  event.preventDefault();

  if(document.getElementById('createUnitNameInput') === null) return;
  if(document.getElementById('createUnitNameError') === null) return;
  if(document.getElementById('createUnitParentInput') === null) return;

  document.getElementById('createUnitNameError').removeAttribute('style');

  if(new RegExp(`^(\\S)+(( )?(\\S)+)*$`).test(document.getElementById('createUnitNameInput').value.toLowerCase()) === false)
  {
    return document.getElementById('createUnitNameError').style.display = 'block';
  }

  if(document.getElementById('createUnitParentInput').value.length === 0) return;

  createBackground('createUnitBackground');

  if(appStrings !== null)
  {
    return createUnitOpenConfirmation();
  }

  displayLoader('', (loader) =>
  {
    createUnitGetStrings(loader);
  });
}

/****************************************************************************************************/

function createUnitGetStrings(loader)
{
  getAdministrationAppStrings((error, strings) =>
  {
    removeLoader(loader, () => {  });

    if(error !== null)
    {
      removeBackground('createUnitBackground');

      return displayError(error.message, error.detail, 'createUnitError');
    }

    appStrings = strings;

    return createUnitOpenConfirmation();
  });
}

/****************************************************************************************************/

function createUnitOpenConfirmation()
{
  var popup   = document.createElement('div');
  var buttons = document.createElement('div');
  var confirm = document.createElement('button');
  var cancel  = document.createElement('button');

  popup       .setAttribute('id', 'createUnitPopup');

  popup       .setAttribute('class', 'confirmationAccountPopup');
  buttons     .setAttribute('class', 'confirmationAccountPopupButtons');
  confirm     .setAttribute('class', 'confirmationAccountPopupSave');
  cancel      .setAttribute('class', 'confirmationAccountPopupCancel');

  popup       .innerHTML += `<div class="confirmationAccountPopupTitle">${appStrings.unitsCreate.confirmationPopup.title}</div>`;
  popup       .innerHTML += `<div class="confirmationAccountPopupMessage">${appStrings.unitsCreate.confirmationPopup.message}</div>`;

  confirm     .innerText = appStrings.unitsCreate.confirmationPopup.confirm;
  cancel      .innerText = appStrings.unitsCreate.confirmationPopup.cancel;

  confirm     .addEventListener('click', sendUnitDataToServer);

  cancel      .addEventListener('click', () =>
  {
    popup.remove();
    removeBackground('createUnitBackground');
  });

  buttons     .appendChild(confirm);
  buttons     .appendChild(cancel);
  popup       .appendChild(buttons);

  document.body.appendChild(popup);
}

/****************************************************************************************************/

function sendUnitDataToServer()
{
  if(document.getElementById('createUnitPopup')) document.getElementById('createUnitPopup').remove();

  if(document.getElementById('createUnitNameInput') == null) return;
  if(document.getElementById('createUnitParentInput') == null) return;

  const unitName = document.getElementById('createUnitNameInput').value;
  const unitParent = parseInt(document.getElementById('createUnitParentInput').value);

  displayLoader(appStrings.unitsCreate.savingLoaderMessage, (loader) =>
  {
    $.ajax(
    {
      method: 'POST', dataType: 'json', timeout: 120000, data: { unitName: unitName, unitParent: unitParent }, url: '/queries/administration/units/create-unit',

      error: (xhr, textStatus, errorThrown) =>
      {
        removeLoader(loader, () => {  });

        removeBackground('createUnitBackground');

        xhr.responseJSON != undefined
        ? displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'createUnitError')
        : displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'createUnitError');
      }

    }).done((result) =>
    {
      removeLoader(loader, () => {  });

      removeBackground('createUnitBackground');

      document.getElementById('createUnitForm').reset();

      displaySuccess(result.message, null, 'createUnitSuccess');
    });
  });
}

/****************************************************************************************************/
