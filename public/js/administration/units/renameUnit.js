/****************************************************************************************************/

let appStrings = null;

/****************************************************************************************************/

function renameUnit(currentName, unitId)
{
  if(document.getElementById('renameUnitWrapper')) return;

  if(appStrings === null)
  {
    return renameUnitGetStrings(currentName, unitId);
  }

  return renameUnitOpenPopup(currentName, unitId);
}

/****************************************************************************************************/

function renameUnitGetStrings(currentName, unitId)
{
  createBackground('renameUnit');

  displayLoader('', (loader) =>
  {
    $.ajax(
    {
      method: 'GET', timeout: 10000, dataType: 'JSON', url: '/queries/strings/get-administration', success: () => {},
      error: (xhr, status, error) =>
      {
        removeLoader(loader, () =>
        {
          removeBackground('renameUnit');

          xhr.responseJSON !== undefined
          ? displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'renameUnitError')
          : displayError('Échec de communication avec le serveur. Celui-ci est peut-être indisponible.', null, 'renameUnitError');
        });
      }

    }).done((result) =>
    {
      removeLoader(loader, () =>
      {
        removeBackground('renameUnit');

        appStrings = result.strings;

        return renameUnitOpenPopup(currentName, unitId);
      });
    });
  });
}

/****************************************************************************************************/

function renameUnitOpenPopup(currentName, unitId)
{
  createBackground('renameUnit');

  const wrapper                 = document.createElement('div');
  const container               = document.createElement('div');
  const popup                   = document.createElement('div');
  const popupForm               = document.createElement('form');
  const popupFormCurrentName    = document.createElement('div');
  const popupFormNewName        = document.createElement('div');
  const popupFormButtons        = document.createElement('div');
  const popupFormButtonsSubmit  = document.createElement('button');
  const popupFormButtonsCancel  = document.createElement('button');

  wrapper                 .setAttribute('id', 'renameUnitWrapper');
  wrapper                 .setAttribute('name', unitId);

  wrapper                 .setAttribute('class', 'renameUnitWrapper');
  container               .setAttribute('class', 'renameUnitContainer');
  popup                   .setAttribute('class', 'renameUnitPopup');
  popupForm               .setAttribute('class', 'renameUnitPopupForm');
  popupFormCurrentName    .setAttribute('class', 'renameUnitPopupFormElement');
  popupFormNewName        .setAttribute('class', 'renameUnitPopupFormElement');
  popupFormButtons        .setAttribute('class', 'renameUnitPopupFormButtons');
  popupFormButtonsSubmit  .setAttribute('class', 'renameUnitPopupFormButtonsSubmit');
  popupFormButtonsCancel  .setAttribute('class', 'renameUnitPopupFormButtonsCancel');

  popup                   .innerHTML += `<div class="renameUnitPopupHeader">${appStrings.unitsHome.renameUnit.popupHeader}</div>`;

  popupFormCurrentName    .innerHTML += `<label>${appStrings.unitsHome.renameUnit.currentNameLabel}</label>`;
  popupFormCurrentName    .innerHTML += `<input type="text" value="${currentName}" disabled />`;

  popupFormNewName        .innerHTML += `<label>${appStrings.unitsHome.renameUnit.newNameLabel}</label>`;
  popupFormNewName        .innerHTML += `<input name="name" type="text" placeholder="${appStrings.unitsHome.renameUnit.newNameLabel}" required />`;

  popupFormButtonsSubmit  .innerText = appStrings.unitsHome.renameUnit.submitButton;
  popupFormButtonsCancel  .innerText = appStrings.unitsHome.renameUnit.cancelButton;

  popupFormButtonsCancel  .addEventListener('click', () =>
  {
    event.preventDefault();
    wrapper.remove();
    removeBackground('renameUnit');
  });

  popupForm               .addEventListener('submit', renameUnitSendToServer);

  popupFormButtons        .appendChild(popupFormButtonsSubmit);
  popupFormButtons        .appendChild(popupFormButtonsCancel);
  popupForm               .appendChild(popupFormCurrentName);
  popupForm               .appendChild(popupFormNewName);
  popupForm               .appendChild(popupFormButtons);
  popup                   .appendChild(popupForm);
  container               .appendChild(popup);
  wrapper                 .appendChild(container);
  document.body           .appendChild(wrapper);
}

/****************************************************************************************************/

function renameUnitSendToServer(event)
{
  event.preventDefault();

  const newName = event.target.elements['name'].value.trim();
  const unitId = document.getElementById('renameUnitWrapper').getAttribute('name');

  if(new RegExp(`^(\\S)+(( )?(\\S)+)*$`).test(newName) === false)
  {
    return displayError(appStrings.unitsHome.renameUnit.formatError, null, 'renameUnitError');
  }

  document.getElementById('renameUnitWrapper').style.display = 'none';

  displayLoader(appStrings.unitsHome.renameUnit.loaderMessage, (loader) =>
  {
    $.ajax(
    {
      method: 'POST',
      dataType: 'JSON',
      timeout: 10000,
      data: { newName: newName, unitId: unitId },
      url: '/queries/administration/units/rename-unit',

      error: (xhr, textStatus, errorThrown) =>
      {
        removeLoader(loader, () =>
        {
          document.getElementById('renameUnitWrapper').removeAttribute('style');

          xhr.responseJSON != undefined
          ? displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'renameUnitError')
          : displayError(appStrings.unitsHome.renameUnit.genericRequestError, null, 'renameUnitError');
        });
      }

    }).done((result) =>
    {
      removeLoader(loader, () =>
      {
        document.getElementById('renameUnitWrapper').remove();
        removeBackground('renameUnit');

        return displaySuccess(result.message, null, 'renameUnitSuccess');
      });
    });
  });
}

/****************************************************************************************************/
