/***************************************************************************************************/

var storageStrings = null;
var currentServiceUuid = null;

/***************************************************************************************************/

function removeService(serviceUuid)
{
  if(document.getElementById('removeServiceConfirmationPopup')) return;

  currentServiceUuid = serviceUuid;

  createBackground('removeServiceConfirmationBackground');

  displayLoader('', (loader) =>
  {
    getStorageAppStrings((error, strings) =>
    {
      removeLoader(loader, () =>
      {
        if(error != null)
        {
          removeBackground('removeServiceConfirmationBackground');

          displayError(error.message, error.detail, null);

          return
        }

        storageStrings = strings;

        openRemoveConfirmationPopup();
      });
    });
  });
}

/***************************************************************************************************/

function openRemoveConfirmationPopup()
{
  var popup   = document.createElement('div');

  popup       .setAttribute('id', 'removeServiceConfirmationPopup');
  popup       .setAttribute('class', 'removeServiceConfirmationPopup');

  popup       .innerHTML += `<div class="removeServiceConfirmationPopupTitle">${storageStrings.admin.services.listPage.removeServiceConfirmationPopup.title}</div>`;
  popup       .innerHTML += `<div class="removeServiceConfirmationPopupMessage">${storageStrings.admin.services.listPage.removeServiceConfirmationPopup.message}</div>`;
  popup       .innerHTML += `<div class="removeServiceConfirmationPopupButtons"><button class="removeServiceConfirmationPopupButtonsConfirm" onclick="sendRemoveDataToServer()">${storageStrings.admin.services.listPage.removeServiceConfirmationPopup.confirm}</button><button class="removeServiceConfirmationPopupButtonsCancel" onclick="closeRemoveConfirmationPopup()">${storageStrings.admin.services.listPage.removeServiceConfirmationPopup.cancel}</button></div>`;

  document.body.appendChild(popup);
}

/***************************************************************************************************/

function closeRemoveConfirmationPopup()
{
  currentServiceUuid = null;

  removeBackground('removeServiceConfirmationBackground');

  if(document.getElementById('removeServiceConfirmationPopup')) document.getElementById('removeServiceConfirmationPopup').remove();
}

/***************************************************************************************************/

function sendRemoveDataToServer()
{
  if(document.getElementById('removeServiceConfirmationPopup')) document.getElementById('removeServiceConfirmationPopup').remove();

  displayLoader(storageStrings.admin.services.listPage.sendingData.message, (loader) =>
  {
    $.ajax(
    {
      type: 'PUT', timeout: 5000, dataType: 'JSON', data: { serviceUuid: currentServiceUuid }, url: '/queries/storage/admin/remove-service',
      
      error: (xhr, status, error) => 
      {
        removeLoader(loader, () =>
        {
          removeBackground('removeServiceConfirmationBackground');

          xhr.responseJSON != undefined ?
          displayError(xhr.responseJSON.message, xhr.responseJSON.detail, null) :
          displayError('Une erreur est survenue, veuillez réessayer plus tard', null, null);
        });
      }
                  
    }).done((result) =>
    {
      removeLoader(loader, () =>
      {
        removeBackground('removeServiceConfirmationBackground');
      });
    });
  });
}

/***************************************************************************************************/