/****************************************************************************************************/

if(document.getElementById('accountDataUpdatePicture')) document.getElementById('accountDataUpdatePicture').addEventListener('click', openPictureUpdatePopup);

var strings = null;

/****************************************************************************************************/

function removePopupAndBackground(event)
{
  document.getElementById('accountDataUpdateBackground').remove();
  document.getElementById('accountDataUpdatePopup').remove();
}

/****************************************************************************************************/

function openPictureUpdatePopup(event)
{
  if(document.getElementById('accountDataUpdatePopup')) return;

  displayLoader('', (loader) =>
  {
    $.ajax(
    {
      type: 'GET', timeout: 5000, dataType: 'JSON', url: '/queries/strings/get-common', success: () => {},
      error: (xhr, status, error) =>
      {
        removeLoader(loader, () =>
        {
          xhr.responseJSON != undefined ?
          displayError(xhr.responseJSON.message, xhr.responseJSON.detail, null) :
          displayError('Une erreur est survenue, veuillez réessayer plus tard', null, null);
        });
      }
                          
    }).done((result) =>
    {
      removeLoader(loader, () => {  });

      strings = result.strings;

      var background  = document.createElement('div');
      var popup       = document.createElement('div');
      var form        = document.createElement('form');

      background      .setAttribute('class', 'standardBackground');
      popup           .setAttribute('class', 'standardPopup');
      form            .setAttribute('class', 'accountDataUpdateForm');

      background      .setAttribute('id', 'accountDataUpdateBackground');
      popup           .setAttribute('id', 'accountDataUpdatePopup');

      popup           .innerHTML += `<div class="standardPopupTitle">${strings.root.account.accountUpdate.pictureLabel}</div>`;
      popup           .innerHTML += `<div class="standardPopupMessage">${strings.root.account.accountUpdate.pictureHelp}</div>`;
      form            .innerHTML += `<input name="picture" type="file" accept=".jpg,.png" class="accountDataUpdateFormInput" required/><button class="accountDataUpdateFormSubmit" type="submit">${strings.global.save}</button>`;

      background      .addEventListener('click', removePopupAndBackground);

      form            .addEventListener('submit', sendNewPictureToServer);

      popup           .appendChild(form);

      document.body   .appendChild(background);
      document.body   .appendChild(popup);
    });
  });
}

/****************************************************************************************************/

function sendNewPictureToServer(event)
{
  event.preventDefault();

  if(document.getElementById('accountDataUpdateError')) document.getElementById('accountDataUpdateError').remove();

  const newPictureFile = event.target.elements['picture'].files[0];
  const newPictureName = event.target.elements['picture'].files[0].name;

  if(newPictureName.split('.').length !== 2)
  {
    var error     = document.createElement('div');
    error         .setAttribute('id', 'accountDataUpdateError');
    error         .setAttribute('class', 'accountDataUpdateError');
    error         .innerText = strings.root.account.accountUpdate.pictureFormatError;
    event.target  .insertBefore(error, event.target.children[0]);

    return;
  }

  if(newPictureName.split('.')[1].toLowerCase() !== 'png' && newPictureName.split('.')[1].toLowerCase() !== 'jpg' && newPictureName.split('.')[1].toLowerCase() !== 'jpeg')
  {
    var error     = document.createElement('div');
    error         .setAttribute('id', 'accountDataUpdateError');
    error         .setAttribute('class', 'accountDataUpdateError');
    error         .innerText = strings.root.account.accountUpdate.pictureFormatError;
    event.target  .insertBefore(error, event.target.children[0]);

    return;
  }

  var fileReader = new FileReader();
    
  fileReader.addEventListener('load', (event) =>
  {
    document.getElementById('accountDataUpdatePopup').style.display = 'none';
    document.getElementById('accountDataUpdateBackground').removeEventListener('click', removePopupAndBackground);

    displayLoader(strings.root.account.accountUpdate.pictureSending, (loader) =>
    {
      $.ajax(
      {
        type: 'PUT', timeout: 10000, dataType: 'JSON', data: { picture: event.target.result }, url: '/queries/root/account/update-picture', success: () => {},
        error: (xhr, status, error) =>
        {
          removeLoader(loader, () =>
          {
            document.getElementById('accountDataUpdatePopup').removeAttribute('style');
            document.getElementById('accountDataUpdateBackground').addEventListener('click', removePopupAndBackground);

            xhr.responseJSON != undefined ?
            displayError(xhr.responseJSON.message, xhr.responseJSON.detail, null) :
            displayError('Une erreur est survenue, veuillez réessayer plus tard', null, null);
          });
        }
                            
      }).done((result) =>
      {
        removeLoader(loader, () =>
        {
          document.getElementById('accountDataUpdatePopup').remove();
          document.getElementById('accountDataUpdateBackground').remove();

          document.getElementById('accountDataPicture').setAttribute('src', event.target.result);

          if(document.getElementById('headerBlockNavigationAccountBlockPicture')) document.getElementById('headerBlockNavigationAccountBlockPicture').setAttribute('src', event.target.result);

          displaySuccess('Votre image a été modifiée', null);
        });
      });
    });
  }); 
    
  fileReader.readAsDataURL(newPictureFile);
}

/****************************************************************************************************/