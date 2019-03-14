/****************************************************************************************************/

function createFolderOpenPrompt()
{
  if(document.getElementById('veilBackground')) return;

  document.getElementById('mainContainer').style.filter ='blur(4px)';

  var veilBackground        = document.createElement('div');
  var verticalBackground    = document.createElement('div');
  var horizontalBackground  = document.createElement('div');
  var modal                 = document.createElement('div');
  var modalHeader           = document.createElement('div');
  var modalHeaderTitle      = document.createElement('div');
  var modalForm             = document.createElement('form');
  var modalFormButtons      = document.createElement('div');
  var modalFormConfirm      = document.createElement('button');
  var modalFormCancel       = document.createElement('button');

  veilBackground        .setAttribute('id', 'veilBackground');
  verticalBackground    .setAttribute('id', 'modalBackground');

  veilBackground        .setAttribute('class', 'veilBackground');
  verticalBackground    .setAttribute('class', 'modalBackgroundVertical');
  horizontalBackground  .setAttribute('class', 'modalBackgroundHorizontal');
  modal                 .setAttribute('class', 'baseModal');
  modalHeader           .setAttribute('class', 'baseModalHeader');
  modalHeaderTitle      .setAttribute('class', 'baseModalHeaderTitle');
  modalForm             .setAttribute('class', 'serviceCreateFolderForm');
  modalFormButtons      .setAttribute('class', 'serviceCreateFolderFormButtons');
  modalFormConfirm      .setAttribute('class', 'serviceCreateFolderFormButtonsSubmit');
  modalFormCancel       .setAttribute('class', 'serviceCreateFolderFormButtonsCancel');

  modalHeaderTitle      .innerText = storageStrings.services.newFolder.popupTitle;
  modalFormConfirm      .innerText = storageStrings.services.newFolder.popupSendButton;
  modalFormCancel       .innerText = storageStrings.services.newFolder.popupCancelButton;

  modalForm             .innerHTML += `<div class="serviceCreateFolderFormMessage">${storageStrings.services.newFolder.popupHelpMessage}</div>`;
  modalForm             .innerHTML += `<input name="name" type="text" class="serviceCreateFolderFormInput" placeholder="${storageStrings.services.newFolder.popupPlaceholder}" required />`;

  modalHeader           .appendChild(modalHeaderTitle);
  modalForm             .appendChild(modalFormButtons);
  modalFormButtons      .appendChild(modalFormConfirm);
  modalFormButtons      .appendChild(modalFormCancel);
  modal                 .appendChild(modalHeader);
  modal                 .appendChild(modalForm);

  verticalBackground    .appendChild(horizontalBackground);
  horizontalBackground  .appendChild(modal);

  modalForm             .addEventListener('submit', createFolderSendToServer);

  modalFormCancel       .addEventListener('click', () =>
  {
    event.preventDefault();
    document.getElementById('mainContainer').removeAttribute('style');
    verticalBackground.remove();
    veilBackground.remove();
  });

  document.body         .appendChild(veilBackground);
  document.body         .appendChild(verticalBackground);
}

/****************************************************************************************************/

function createFolderSendToServer(event)
{
  event.preventDefault();

  checkMessageTag('createFolderFormatError');

  const folderName = event.target.elements['name'].value.trim();

  if(folderName.indexOf('*') > -1 || folderName.indexOf('!') > -1 || folderName.indexOf(':') > -1 || folderName.indexOf('?') > -1 || folderName.indexOf('"') > -1 || folderName.indexOf('<') > -1 || folderName.indexOf('>') > -1 || folderName.indexOf('|') > -1)
  {
    return displayError(storageStrings.services.newFolder.popupFormatError, null, 'createFolderFormatError');
  }

  document.getElementById('modalBackground').style.display = 'none';

  displayLoader(storageStrings.services.newFolder.popupLoader, (loader) =>
  {
    $.ajax(
    {
      method: 'POST', dataType: 'json', timeout: 10000, data: { newFolderName: folderName, parentFolderUuid: document.getElementById('currentServiceFolder').hasAttribute('name') ? document.getElementById('currentServiceFolder').getAttribute('name') : '', serviceUuid: document.getElementById('serviceStorageContainer').getAttribute('name') }, url: '/queries/storage/services/create-new-folder',

      error: (xhr, textStatus, errorThrown) =>
      {
        removeLoader(loader, () => {  });

        document.getElementById('modalBackground').removeAttribute('style');

        xhr.responseJSON != undefined ?
        displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'createNewFolderError') :
        displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'createNewFolderError');
      }

    }).done((result) =>
    {
      removeLoader(loader, () =>
      {
        document.getElementById('mainContainer').removeAttribute('style');
        document.getElementById('veilBackground').remove();
        document.getElementById('modalBackground').remove();

        displaySuccess(result.message, null, 'createNewFolderSuccess');
      });
    });
  });
}

/****************************************************************************************************/
