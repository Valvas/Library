/****************************************************************************************************/

if(document.getElementById('accountDataUpdatePassword')) document.getElementById('accountDataUpdatePassword').addEventListener('click', openPasswordUpdatePopup);

var strings = null;

/****************************************************************************************************/

function openPasswordUpdatePopup(event)
{
  if(document.getElementById('accountDataUpdatePopup')) return;

  displayLoader('', '', null, (loader) =>
  {
    $.ajax(
    {
      type: 'GET', timeout: 5000, dataType: 'JSON', url: '/queries/strings/get-common', success: () => {},
      error: (xhr, status, error) =>
      {
        removeLoader(loader, () =>
        {
          xhr.responseJSON != undefined ?
          displayError('Erreur', xhr.responseJSON.message, xhr.responseJSON.detail) :
          displayError('Erreur', 'Une erreur est survenue, veuillez réessayer plus tard', null);
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

      popup           .innerHTML += `<div class="standardPopupTitle">${strings.root.account.accountUpdate.passwordLabel}</div>`;
      form            .innerHTML += `<input name="oldPassword" placeholder="${strings.root.account.accountUpdate.passwordInputOld}" type="password" class="accountDataUpdateFormInput" required/><input name="newPassword" placeholder="${strings.root.account.accountUpdate.passwordInputNew}" type="password" class="accountDataUpdateFormInput" required/><input name="confirmationPassword" placeholder="${strings.root.account.accountUpdate.passwordInputConfirmation}" type="password" class="accountDataUpdateFormInput" required/><button class="accountDataUpdateFormSubmit" type="submit">${strings.global.save}</button>`;

      background      .addEventListener('click', removePopupAndBackground);

      form            .addEventListener('submit', sendNewPasswordToServer);

      popup           .appendChild(form);

      document.body   .appendChild(background);
      document.body   .appendChild(popup);
    });
  });
}

/****************************************************************************************************/

function sendNewPasswordToServer(event)
{
  event.preventDefault();

  if(document.getElementById('accountDataUpdateError')) document.getElementById('accountDataUpdateError').remove();

  const oldPassword = event.target.elements['oldPassword'].value;
  const newPassword = event.target.elements['newPassword'].value;
  const confirmationPassword = event.target.elements['confirmationPassword'].value;

  if(new RegExp('^[a-zA-Z0-9]{8,64}$').test(newPassword) == false)
  {
    var error     = document.createElement('div');
    error         .setAttribute('id', 'accountDataUpdateError');
    error         .setAttribute('class', 'accountDataUpdateError');
    error         .innerText = strings.root.account.accountUpdate.passwordFormatError;
    event.target  .insertBefore(error, event.target.children[0]);
  }

  else if(newPassword !== confirmationPassword)
  {
    var error     = document.createElement('div');
    error         .setAttribute('id', 'accountDataUpdateError');
    error         .setAttribute('class', 'accountDataUpdateError');
    error         .innerText = strings.root.account.accountUpdate.passwordDusplicateError;
    event.target  .insertBefore(error, event.target.children[0]);
  }

  else
  {
    document.getElementById('accountDataUpdatePopup').style.display = 'none';
    document.getElementById('accountDataUpdateBackground').removeEventListener('click', removePopupAndBackground);

    displayLoader(strings.global.loading, strings.root.account.accountUpdate.passwordSending, null, (loader) =>
    {
      $.ajax(
      {
        type: 'PUT', timeout: 5000, dataType: 'JSON', data: { oldPassword: oldPassword, newPassword: newPassword, confirmationPassword: confirmationPassword }, url: '/queries/root/account/update-password', success: () => {},
        error: (xhr, status, error) =>
        {
          removeLoader(loader, () =>
          {
            document.getElementById('accountDataUpdatePopup').removeAttribute('style');
            document.getElementById('accountDataUpdateBackground').addEventListener('click', removePopupAndBackground);

            xhr.responseJSON != undefined ?
            displayError('Erreur', xhr.responseJSON.message, xhr.responseJSON.detail) :
            displayError('Erreur', 'Une erreur est survenue, veuillez réessayer plus tard', null);
          });
        }
                            
      }).done((result) =>
      {
        removeLoader(loader, () =>
        {
          document.getElementById('accountDataUpdatePopup').remove();
          document.getElementById('accountDataUpdateBackground').remove();

          displaySuccess('Succès', 'Votre mot de passe a été modifié', null);
        });
      });
    });
  }
}

/****************************************************************************************************/