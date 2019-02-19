/****************************************************************************************************/

if(document.getElementById('accountDataUpdatePassword')) document.getElementById('accountDataUpdatePassword').addEventListener('click', getPasswordRules);

var strings = null;

/****************************************************************************************************/

function getPasswordRules(event)
{
  if(document.getElementById('accountDataUpdateBackground')) return;

  createBackground('accountDataUpdateBackground');

  displayLoader('', (loader) =>
  {
    $.ajax(
    {
      type: 'GET', timeout: 5000, dataType: 'JSON', url: '/queries/root/account/get-password-rules', success: () => {},
      error: (xhr, status, error) =>
      {
        removeBackground('accountDataUpdateBackground');

        removeLoader(loader, () =>
        {
          xhr.responseJSON != undefined ?
          displayError(xhr.responseJSON.message, xhr.responseJSON.detail, null) :
          displayError('Une erreur est survenue, veuillez réessayer plus tard', null, null);
        });
      }
                          
    }).done((result) =>
    {
      openPasswordUpdatePopup(result.passwordRules, loader);
    });
  });
}

/****************************************************************************************************/

function openPasswordUpdatePopup(passwordRules, loader)
{
  getCommonStrings((error, commonStrings) =>
  {
    removeLoader(loader, () => {  });

    if(error != null)
    {
      removeBackground('accountDataUpdateBackground');

      return displayError(error.message, error.detail, null);
    }

    strings = commonStrings;

    var popup       = document.createElement('div');
    var close       = document.createElement('div');
    var rules       = document.createElement('div');
    var form        = document.createElement('form');

    popup           .setAttribute('class', 'standardPopup');
    form            .setAttribute('class', 'accountDataUpdateForm');
    close           .setAttribute('class', 'standardPopupClose');
    rules           .setAttribute('class', 'accountDataRulesBlock');

    popup           .setAttribute('id', 'accountDataUpdatePopup');

    close           .innerText = strings.global.close;

    rules           .innerHTML += `<div class="accountDataRulesElement"><div class="accountDataRulesElementKey">${strings.root.account.accountUpdate.passwordRules.minLength}</div><div class="accountDataRulesElementValue">${passwordRules.minLength}</div></div>`;
    rules           .innerHTML += `<div class="accountDataRulesElement"><div class="accountDataRulesElementKey">${strings.root.account.accountUpdate.passwordRules.maxLength}</div><div class="accountDataRulesElementValue">${passwordRules.maxLength}</div></div>`;
    rules           .innerHTML += `<div class="accountDataRulesElement"><div class="accountDataRulesElementKey">${strings.root.account.accountUpdate.passwordRules.lowercasesRequired}</div><div class="accountDataRulesElementValue">${passwordRules.minLowerCases}</div></div>`;
    rules           .innerHTML += `<div class="accountDataRulesElement"><div class="accountDataRulesElementKey">${strings.root.account.accountUpdate.passwordRules.uppercasesRequired}</div><div class="accountDataRulesElementValue">${passwordRules.minUpperCases}</div></div>`;
    rules           .innerHTML += `<div class="accountDataRulesElement"><div class="accountDataRulesElementKey">${strings.root.account.accountUpdate.passwordRules.digitsRequired}</div><div class="accountDataRulesElementValue">${passwordRules.minDigits}</div></div>`;
    rules           .innerHTML += `<div class="accountDataRulesElement"><div class="accountDataRulesElementKey">${strings.root.account.accountUpdate.passwordRules.specialsRequired}</div><div class="accountDataRulesElementValue">${passwordRules.minSpecial}</div></div>`;

    close           .addEventListener('click', () =>
    {
      popup.remove();
      removeBackground('accountDataUpdateBackground');
    });

    popup           .innerHTML += `<div class="standardPopupTitle">${strings.root.account.accountUpdate.passwordLabel}</div>`;

    popup           .appendChild(close);
    popup           .appendChild(rules);

    form            .innerHTML += `<input name="oldPassword" placeholder="${strings.root.account.accountUpdate.passwordInputOld}" type="password" class="accountDataUpdateFormInput" required/><input name="newPassword" placeholder="${strings.root.account.accountUpdate.passwordInputNew}" type="password" class="accountDataUpdateFormInput" required/><input name="confirmationPassword" placeholder="${strings.root.account.accountUpdate.passwordInputConfirmation}" type="password" class="accountDataUpdateFormInput" required/><button class="accountDataUpdateFormSubmit" type="submit">${strings.global.save}</button>`;

    form            .addEventListener('submit', sendNewPasswordToServer);

    popup           .appendChild(form);

    document.body   .appendChild(popup);
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

  if(newPassword !== confirmationPassword)
  {
    var error     = document.createElement('div');
    error         .setAttribute('id', 'accountDataUpdateError');
    error         .setAttribute('class', 'accountDataUpdateError');
    error         .innerText = strings.root.account.accountUpdate.passwordDusplicateError;
    event.target  .insertBefore(error, event.target.children[0]);

    return;
  }

  document.getElementById('accountDataUpdatePopup').style.display = 'none';
  document.getElementById('accountDataUpdateBackground').removeEventListener('click', removePopupAndBackground);

  displayLoader(strings.root.account.accountUpdate.passwordSending, (loader) =>
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
          displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'updatePasswordError') :
          displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'updatePasswordError');
        });
      }
                          
    }).done((result) =>
    {
      removeLoader(loader, () =>
      {
        document.getElementById('accountDataUpdatePopup').remove();
        document.getElementById('accountDataUpdateBackground').remove();

        displaySuccess('Votre mot de passe a été modifié', null);
      });
    });
  });
}

/****************************************************************************************************/