/****************************************************************************************************/

var serviceName = null;
var maxFileSize = null;
var storageStrings = null;
var extensionsChecked = null;

/****************************************************************************************************/

if(document.getElementById('serviceCreationFormBlock')) document.getElementById('serviceCreationFormBlock').addEventListener('submit', submitForm);

if(document.getElementById('serviceCreationFormBlockName')) document.getElementById('serviceCreationFormBlockName').addEventListener('input', () =>
{
  document.getElementById('serviceCreationFormBlockNameIncorrect').removeAttribute('style');
});

/****************************************************************************************************/

function submitForm(event)
{
  event.preventDefault();

  if(document.getElementById('serviceCreationFormBlockName') == null) return;
  if(document.getElementById('serviceCreationFormBlockSizeValue') == null) return;
  if(document.getElementById('serviceCreationFormBlockSizeQuantifier') == null) return;

  if(document.getElementById('serviceCreationSavingBackground')) return;

  serviceName = document.getElementById('serviceCreationFormBlockName').value;
  maxFileSize = parseInt(document.getElementById('serviceCreationFormBlockSizeValue').value) * (Math.pow(1024, parseInt(document.getElementById('serviceCreationFormBlockSizeQuantifier').value)));

  if(new RegExp('^[a-zA-ZÈÉÊËÎÏèéêëîïâäÂÄ0-9]+(( )?[a-zA-ZÈÉÊËÎÏèéêëîïâäÂÄ0-9]+)*$').test(document.getElementById('serviceCreationFormBlockName').value) == false)
  {
    document.getElementById('serviceCreationFormBlockNameIncorrect').style.display = 'block';

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
    document.getElementById('serviceCreationFormBlockExtensionsError').style.display = 'block';

    return;
  }

  if(document.getElementById('serviceCreationFormBlockExtensionsError')) document.getElementById('serviceCreationFormBlockExtensionsError').removeAttribute('style');

  createBackground('serviceCreationSavingBackground');

  displayLoader('', (loader) =>
  {
    getStorageAppStrings((error, strings) =>
    {
      removeLoader(loader, () => {  });

      if(error != null)
      {
        removeBackground('serviceCreationSavingBackground');

        displayError(error.message, error.detail, null);

        return;
      }

      storageStrings = strings;

      openConfirmationPopup();
    });
  });
}

/****************************************************************************************************/

function openConfirmationPopup()
{
  var popup = document.createElement('div');

  popup.setAttribute('id', 'serviceCreationSavingPopup');
  popup.setAttribute('class', 'serviceCreationSavingPopup');

  popup.innerHTML += `<div class="serviceCreationSavingPopupTitle">${storageStrings.admin.services.form.confirmationPopup.title}</div>`;
  popup.innerHTML += `<div class="serviceCreationSavingPopupMessage">${storageStrings.admin.services.form.confirmationPopup.message}</div>`;
  popup.innerHTML += `<div class="serviceCreationSavingPopupButtons"><button class="serviceCreationSavingPopupButtonsConfirm" onclick="sendServiceDataToServer()">${storageStrings.admin.services.form.confirmationPopup.confirm}</button><button class="serviceCreationSavingPopupButtonsCancel" onclick="closeConfirmationPopup()">${storageStrings.admin.services.form.confirmationPopup.cancel}</button></div>`;

  document.body.appendChild(popup);
}

/****************************************************************************************************/

function closeConfirmationPopup()
{
  if(document.getElementById('serviceCreationSavingPopup')) document.getElementById('serviceCreationSavingPopup').remove();

  removeBackground('serviceCreationSavingBackground');
}

/****************************************************************************************************/

function sendServiceDataToServer()
{
  if(document.getElementById('serviceCreationSavingPopup')) document.getElementById('serviceCreationSavingPopup').remove();

  if(serviceName == null || maxFileSize == null || extensionsChecked == null)
  {
    displayError(storageStrings.admin.services.form.missingParameter, null, null);

    removeBackground('serviceCreationSavingBackground');

    return;
  }

  displayLoader(storageStrings.admin.services.form.sendingData.message, (loader) =>
  {
    $.ajax(
    {
      type: 'POST', timeout: 5000, dataType: 'JSON', data: { serviceData: JSON.stringify({ serviceName: serviceName, maxFileSize: maxFileSize, authorizedExtensions: extensionsChecked }) }, url: '/queries/storage/admin/create-service',
      
      error: (xhr, status, error) => 
      {
        removeLoader(loader, () =>
        {
          removeBackground('serviceCreationSavingBackground');

          xhr.responseJSON != undefined ?
          displayError(xhr.responseJSON.message, xhr.responseJSON.detail, null) :
          displayError('Une erreur est survenue, veuillez réessayer plus tard', null, null);
        });
      }
                  
    }).done((result) =>
    {
      removeLoader(loader, () =>
      {
        removeBackground('serviceCreationSavingBackground');

        displaySuccess(result.message, result.detail, null);

        if(document.getElementById('serviceCreationFormBlock')) document.getElementById('serviceCreationFormBlock').reset();
      });
    });
  });
}

/****************************************************************************************************/