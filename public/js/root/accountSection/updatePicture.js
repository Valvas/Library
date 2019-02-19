/****************************************************************************************************/

function updatePictureOpenPopup()
{
  if(document.getElementById('veilBackground')) return;

  document.getElementById('mainContainer').style.filter ='blur(4px)';

  var veilBackground        = document.createElement('div');
  var verticalBackground    = document.createElement('div');
  var horizontalBackground  = document.createElement('div');
  var modal                 = document.createElement('div');
  var modalHeader           = document.createElement('div');
  var modalHeaderTitle      = document.createElement('div');
  var modalHeaderClose      = document.createElement('button');
  var modalContent          = document.createElement('div');
  var modalForm             = document.createElement('form');
  var modalFormSubmit       = document.createElement('div');
  var modalFormSubmitButton = document.createElement('button');

  veilBackground        .setAttribute('id', 'veilBackground');
  verticalBackground    .setAttribute('id', 'modalBackground');

  veilBackground        .setAttribute('class', 'veilBackground');
  verticalBackground    .setAttribute('class', 'modalBackgroundVertical');
  horizontalBackground  .setAttribute('class', 'modalBackgroundHorizontal');
  modal                 .setAttribute('class', 'updateAccountModal');
  modalHeader           .setAttribute('class', 'updateAccountModalHeader');
  modalHeaderTitle      .setAttribute('class', 'updateAccountModalHeaderTitle');
  modalHeaderClose      .setAttribute('class', 'updateAccountModalHeaderClose');
  modalContent          .setAttribute('class', 'updateAccountModalContent');
  modalForm             .setAttribute('class', 'updateAccountModalContentForm');
  modalFormSubmit       .setAttribute('class', 'updateAccountModalContentFormSubmit');
  modalFormSubmitButton .setAttribute('class', 'updateAccountModalContentFormSubmitButton');

  modalHeaderTitle      .innerText = commonStrings.root.account.accountUpdate.pictureLabel;
  modalHeaderClose      .innerText = commonStrings.global.close;
  modalFormSubmitButton .innerText = commonStrings.global.save;

  modalForm             .innerHTML += `<input name="picture" accept="image/png, image/jpeg" class="updateAccountModalContentFormInput" type="file" required />`;

  modalForm             .addEventListener('submit', updatePictureCheckFormat);

  modalHeader           .appendChild(modalHeaderTitle);
  modalHeader           .appendChild(modalHeaderClose);
  modalForm             .appendChild(modalFormSubmit);
  modalFormSubmit       .appendChild(modalFormSubmitButton);
  modalContent          .appendChild(modalForm);
  modal                 .appendChild(modalHeader);
  modal                 .appendChild(modalContent);

  verticalBackground    .appendChild(horizontalBackground);
  horizontalBackground  .appendChild(modal);

  modalHeaderClose      .addEventListener('click', () =>
  {
    checkMessageTag('updatePictureError');
    document.getElementById('mainContainer').removeAttribute('style');
    verticalBackground.remove();
    veilBackground.remove();
  });

  document.body         .appendChild(veilBackground);
  document.body         .appendChild(verticalBackground);
}

/****************************************************************************************************/

function updatePictureCheckFormat(event)
{
  event.preventDefault();

  const newPictureFile = event.target.elements['picture'].files[0];
  const newPictureName = event.target.elements['picture'].files[0].name;

  if(newPictureName.split('.').length !== 2)
  {
    return displayError(commonStrings.root.account.accountUpdate.pictureFormatError, null, 'updatePictureError');
  }

  if(newPictureName.split('.')[1].toLowerCase() !== 'png' && newPictureName.split('.')[1].toLowerCase() !== 'jpg' && newPictureName.split('.')[1].toLowerCase() !== 'jpeg')
  {
    return displayError(commonStrings.root.account.accountUpdate.pictureFormatError, null, 'updatePictureError');
  }

  var fileReader = new FileReader();

  fileReader.addEventListener('load', (event) =>
  {
    return updatePictureSendToServer(event.target.result);
  });

  fileReader.readAsDataURL(newPictureFile);
}

/****************************************************************************************************/

function updatePictureSendToServer(newPicture)
{
  document.getElementById('modalBackground').style.display = 'none';

  var loader  = document.createElement('div');

  loader      .setAttribute('class', 'loaderVerticalContainer');
  loader      .innerHTML = '<div class="loaderHorizontalContainer"><div class="loaderSpinner"></div></div>';

  document.body.appendChild(loader);

  $.ajax(
  {
    type: 'PUT', timeout: 10000, dataType: 'JSON', data: { picture: newPicture }, url: '/queries/root/account/update-picture', success: () => {},
    error: (xhr, status, error) =>
    {
      loader.remove();

      document.getElementById('modalBackground').removeAttribute('style');

      xhr.responseJSON != undefined ?
      displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'updatePictureError') :
      displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'updatePictureError');
    }

  }).done((result) =>
  {
    loader.remove();

    document.getElementById('mainContainer').removeAttribute('style');
    document.getElementById('veilBackground').remove();
    document.getElementById('modalBackground').remove();

    if(document.getElementById('accountCurrentPicture'))
    {
      document.getElementById('accountCurrentPicture').setAttribute('src', newPicture);
    }

    if(document.getElementById('navigationBarAccountPicture'))
    {
      document.getElementById('navigationBarAccountPicture').setAttribute('src', newPicture);
    }

    accountData.picture = newPicture;

    displaySuccess(commonStrings.root.account.accountUpdate.pictureSaved, null, 'updatePictureSuccess');
  });
}

/****************************************************************************************************/
