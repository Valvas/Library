/****************************************************************************************************/

var administrationAppStrings = null;

/****************************************************************************************************/

function updateUnitParent()
{
  const currentSelect = event.target;

  createBackground('updateUnitParentBackground');

  if(administrationAppStrings != null) return updateUnitParentOpenPopup(currentSelect);

  return updateUnitParentGetStrings(currentSelect);
}

/****************************************************************************************************/

function updateUnitParentGetStrings(currentSelect)
{
  displayLoader('', (loader) =>
  {
    getAdministrationAppStrings((error, strings) =>
    {
      removeLoader(loader, () => {  });

      if(error != null)
      {
        removeBackground('updateUnitParentBackground');
        
        return displayError(error.message, error.detail, 'updateUnitParentError');
      }

      administrationAppStrings = strings;

      return updateUnitParentOpenPopup(currentSelect);
    });
  });
}

/****************************************************************************************************/

function updateUnitParentOpenPopup(currentSelect)
{
  var message = administrationAppStrings.unitsHome.updateUnitParentPopup.message.replace('[$1$]', `<b>${currentSelect.options[currentSelect.selectedIndex].text}</b>`);

  var popup   = document.createElement('div');
  var buttons = document.createElement('div');
  var confirm = document.createElement('button');
  var cancel  = document.createElement('button');

  popup       .setAttribute('id', 'updateUnitParentPopup');

  popup       .setAttribute('class', 'standardPopup');
  buttons     .setAttribute('class', 'unitsPopupButtons');
  confirm     .setAttribute('class', 'unitsPopupButtonsConfirm');
  cancel      .setAttribute('class', 'unitsPopupButtonsCancel');

  popup       .innerHTML += `<div class="standardPopupTitle">${administrationAppStrings.unitsHome.updateUnitParentPopup.title}</div>`;
  popup       .innerHTML += `<div class="standardPopupMessage">${message}</div>`;

  confirm     .innerText = administrationAppStrings.unitsHome.updateUnitParentPopup.confirm;
  cancel      .innerText = administrationAppStrings.unitsHome.updateUnitParentPopup.cancel;

  confirm     .addEventListener('click', () =>
  {
    popup.remove();
    updateUnitParentSendToServer(currentSelect);
  });

  cancel      .addEventListener('click', () =>
  {
    popup.remove();
    removeBackground('updateUnitParentBackground');
    currentSelect.value = currentSelect.getAttribute('name');
  });

  buttons     .appendChild(confirm);
  buttons     .appendChild(cancel);
  popup       .appendChild(buttons);

  document.body.appendChild(popup);
}

/****************************************************************************************************/

function updateUnitParentSendToServer(currentSelect)
{
  displayLoader(administrationAppStrings.unitsHome.updateUnitParentPopup.loader, (loader) =>
  {
    $.ajax(
    {
      method: 'PUT', dataType: 'json', timeout: 10000, data: { unitId: currentSelect.parentNode.parentNode.getAttribute('name'), newParentId: currentSelect.value }, url: '/queries/administration/units/update-unit-parent',

      error: (xhr, textStatus, errorThrown) =>
      {
        removeLoader(loader, () => {  });

        removeBackground('updateUnitParentBackground');

        xhr.responseJSON != undefined
        ? displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'updateUnitParentError')
        : displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'updateUnitParentError');
      }

    }).done((result) =>
    {
      removeLoader(loader, () => {  });

      removeBackground('updateUnitParentBackground');

      displaySuccess(result.message, null, 'updateUnitParentSuccess');

      var units = {};

      for(var x = 0; x < result.units.length; x++) units[result.units[x].unitId] = result.units[x];

      const currentUnits = document.getElementById('unitList').children;

      for(var x = 0; x < currentUnits.length; x++)
      {
        const currentUnitData = units[currentUnits[x].getAttribute('name')];

        if(currentUnitData.unitParent == null) continue;

        const currentUnitSelect = currentUnits[x].children[2].children[0];

        currentUnitSelect.setAttribute('name', currentUnitData.unitParent.parentId);

        currentUnitSelect.innerHTML = '';

        for(var unit in units)
        {
          if(units[unit].unitId === currentUnitData.unitId) continue;
          if(currentUnitData.unitChildren.includes(units[unit].unitId)) continue;

          currentUnitSelect.innerHTML += currentUnitData.unitParent.parentId === units[unit].unitId
          ? `<option value="${units[unit].unitId}" selected>${units[unit].unitName}</option>`
          : `<option value="${units[unit].unitId}">${units[unit].unitName}</option>`;
        }
      }
    });
  });
}

/****************************************************************************************************/