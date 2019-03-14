/****************************************************************************************************/

var serviceUuid = null;
var serviceName = null;
var maxFileSize = null;
var storageStrings = null;
var extensionsChecked = null;

/****************************************************************************************************/

if(document.getElementById('serviceUpdateFormBlock'))
{
  serviceUuid = document.getElementById('serviceUpdateFormBlock').getAttribute('name');

  document.getElementById('serviceUpdateFormBlock').addEventListener('submit', updateService);
}

if(document.getElementById('serviceUpdateFormBlockName')) document.getElementById('serviceUpdateFormBlockName').addEventListener('input', () =>
{
  document.getElementById('serviceUpdateFormBlockNameIncorrect').removeAttribute('style');
});

/****************************************************************************************************/

function updateService(event)
{
  event.preventDefault();

  if(document.getElementById('serviceUpdateFormBlockName') == null) return;
  if(document.getElementById('serviceUpdateFormBlockSizeValue') == null) return;
  if(document.getElementById('serviceUpdateFormBlockSizeQuantifier') == null) return;

  if(document.getElementById('updateServiceConfirmationBackground')) return;

  serviceName = document.getElementById('serviceUpdateFormBlockName').value;
  maxFileSize = parseInt(document.getElementById('serviceUpdateFormBlockSizeValue').value) * (Math.pow(1024, parseInt(document.getElementById('serviceUpdateFormBlockSizeQuantifier').value)));

  if(new RegExp('^[a-zA-ZÈÉÊËÎÏèéêëîïâäÂÄ0-9]+(( )?[a-zA-ZÈÉÊËÎÏèéêëîïâäÂÄ0-9]+)*$').test(document.getElementById('serviceUpdateFormBlockName').value) == false)
  {
    document.getElementById('serviceUpdateFormBlockNameIncorrect').style.display = 'block';

    return;
  }

  var extensionCheckboxes = document.getElementsByName('extensionCheckbox');

  extensionsChecked = [];

  for(var x = 0; x < extensionCheckboxes.length; x++)
  {
    if(extensionCheckboxes[x].checked) extensionsChecked.push(extensionCheckboxes[x].value);
  }

  if(extensionsChecked.length === 0)
  {
    document.getElementById('serviceUpdateFormBlockExtensionsError').style.display = 'block';

    return;
  }

  if(document.getElementById('serviceUpdateFormBlockExtensionsError')) document.getElementById('serviceUpdateFormBlockExtensionsError').removeAttribute('style');

  createBackground('updateServiceConfirmationBackground');

  displayLoader('', (loader) =>
  {
    getStorageAppStrings((error, strings) =>
    {
      removeLoader(loader, () => {  });

      if(error != null)
      {
        removeBackground('updateServiceConfirmationBackground');

        return displayError(error.message, error.detail, null);
      }

      storageStrings = strings;

      openConfirmationPopup();
    });
  });
}

/****************************************************************************************************/

function openConfirmationPopup()
{
  var popup   = document.createElement('div');

  popup       .setAttribute('id', 'updateServiceConfirmationPopup');
  popup       .setAttribute('class', 'serviceCreationSavingPopup');

  popup       .innerHTML += `<div class="serviceCreationSavingPopupTitle">${storageStrings.admin.services.updatePage.updateConfirmationPopup.title}</div>`;
  popup       .innerHTML += `<div class="serviceCreationSavingPopupMessage">${storageStrings.admin.services.updatePage.updateConfirmationPopup.message}</div>`;
  popup       .innerHTML += `<div class="serviceCreationSavingPopupButtons"><button class="serviceCreationSavingPopupButtonsConfirm" onclick="sendServiceDataToServer()">${storageStrings.admin.services.updatePage.updateConfirmationPopup.confirm}</button><button class="serviceCreationSavingPopupButtonsCancel" onclick="closeUpdateConfirmationPopup()">${storageStrings.admin.services.updatePage.updateConfirmationPopup.cancel}</button></div>`;

  document.body.appendChild(popup);
}

/****************************************************************************************************/

function closeUpdateConfirmationPopup()
{
  if(document.getElementById('updateServiceConfirmationPopup')) document.getElementById('updateServiceConfirmationPopup').remove();

  removeBackground('updateServiceConfirmationBackground');
}

/****************************************************************************************************/

function sendServiceDataToServer()
{
  if(document.getElementById('updateServiceConfirmationPopup')) document.getElementById('updateServiceConfirmationPopup').remove();

  if(serviceName == null || maxFileSize == null || extensionsChecked == null)
  {
    displayError(storageStrings.admin.services.form.missingParameter, null, null);

    removeBackground('updateServiceConfirmationBackground');

    return;
  }

  displayLoader(storageStrings.admin.services.updatePage.sendingData.message, (loader) =>
  {
    $.ajax(
    {
      type: 'PUT', timeout: 5000, dataType: 'JSON', data: { serviceData: JSON.stringify({ serviceUuid: serviceUuid, serviceName: serviceName, maxFileSize: maxFileSize, authorizedExtensions: extensionsChecked }) }, url: '/queries/storage/admin/update-service',

      error: (xhr, status, error) =>
      {
        removeLoader(loader, () =>
        {
          removeBackground('updateServiceConfirmationBackground');

          xhr.responseJSON != undefined ?
          displayError(xhr.responseJSON.message, xhr.responseJSON.detail, null) :
          displayError('Une erreur est survenue, veuillez réessayer plus tard', null, null);
        });
      }

    }).done((result) =>
    {
      removeLoader(loader, () =>
      {
        removeBackground('updateServiceConfirmationBackground');

        displaySuccess(result.message, result.detail, null);
      });
    });
  });
}

/****************************************************************************************************/
