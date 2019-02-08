/****************************************************************************************************/

function updatePasswordOpenPopup()
{
  if(document.getElementById('veilBackground')) return;

  document.getElementById('mainContainer').style.filter ='blur(4px)';

  checkMessageTag('updatePasswordError');

  var loader  = document.createElement('div');

  loader      .setAttribute('class', 'loaderVerticalContainer');
  loader      .innerHTML = '<div class="loaderHorizontalContainer"><div class="loaderSpinner"></div></div>';

  document.body.appendChild(loader);

  $.ajax(
  {
    type: 'GET', timeout: 10000, dataType: 'JSON', url: '/queries/root/account/get-password-rules', success: () => {},
    error: (xhr, status, error) =>
    {
      loader.remove();

      document.getElementById('mainContainer').removeAttribute('style');

      xhr.responseJSON != undefined ?
      displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'updatePasswordError') :
      displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'updatePasswordError');
    }

  }).done((result) =>
  {
    loader.remove();

    var passwordRules = result.passwordRules;

    var veilBackground        = document.createElement('div');
    var verticalBackground    = document.createElement('div');
    var horizontalBackground  = document.createElement('div');
    var modal                 = document.createElement('div');
    var modalHeader           = document.createElement('div');
    var modalHeaderTitle      = document.createElement('div');
    var modalHeaderClose      = document.createElement('button');
    var modalContent          = document.createElement('div');
    var modalCurrent          = document.createElement('div');
    var modalForm             = document.createElement('form');
    var modalFormSubmit       = document.createElement('div');
    var modalFormSubmitButton = document.createElement('button');
    var modalInfo             = document.createElement('div');

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
    modalInfo             .setAttribute('class', 'updateAccountModalContentInfo');
    modalForm             .setAttribute('class', 'updateAccountModalContentForm');
    modalFormSubmit       .setAttribute('class', 'updateAccountModalContentFormSubmit');
    modalFormSubmitButton .setAttribute('class', 'updateAccountModalContentFormSubmitButton');

    modalHeaderTitle      .innerText = commonStrings.root.account.accountUpdate.passwordLabel;
    modalHeaderClose      .innerText = commonStrings.global.close;
    modalFormSubmitButton .innerText = commonStrings.global.save;

    modalInfo             .innerHTML += `<div class="updateAccountModalContentInfoRow"><div class="updateAccountModalContentInfoRowKey">${commonStrings.root.account.accountUpdate.passwordRules.minLength}</div><div class="updateAccountModalContentInfoRowValue">${passwordRules.minLength}</div></div>`;
    modalInfo             .innerHTML += `<div class="updateAccountModalContentInfoRow"><div class="updateAccountModalContentInfoRowKey">${commonStrings.root.account.accountUpdate.passwordRules.maxLength}</div><div class="updateAccountModalContentInfoRowValue">${passwordRules.maxLength}</div></div>`;
    modalInfo             .innerHTML += `<div class="updateAccountModalContentInfoRow"><div class="updateAccountModalContentInfoRowKey">${commonStrings.root.account.accountUpdate.passwordRules.lowercasesRequired}</div><div class="updateAccountModalContentInfoRowValue">${passwordRules.minLowerCases}</div></div>`;
    modalInfo             .innerHTML += `<div class="updateAccountModalContentInfoRow"><div class="updateAccountModalContentInfoRowKey">${commonStrings.root.account.accountUpdate.passwordRules.uppercasesRequired}</div><div class="updateAccountModalContentInfoRowValue">${passwordRules.minUpperCases}</div></div>`;
    modalInfo             .innerHTML += `<div class="updateAccountModalContentInfoRow"><div class="updateAccountModalContentInfoRowKey">${commonStrings.root.account.accountUpdate.passwordRules.digitsRequired}</div><div class="updateAccountModalContentInfoRowValue">${passwordRules.minDigits}</div></div>`;
    modalInfo             .innerHTML += `<div class="updateAccountModalContentInfoRow"><div class="updateAccountModalContentInfoRowKey">${commonStrings.root.account.accountUpdate.passwordRules.specialsRequired}</div><div class="updateAccountModalContentInfoRowValue">${passwordRules.minSpecial}</div></div>`;

    modalForm             .innerHTML += `<div class="updateAccountModalContentFormLabel">${commonStrings.root.account.accountUpdate.passwordInputOld}</div>`;
    modalForm             .innerHTML += `<input name="old" class="updateAccountModalContentFormInput" type="password" placeholder="${commonStrings.root.account.accountUpdate.passwordInputOld}" required />`;
    modalForm             .innerHTML += `<div class="updateAccountModalContentFormLabel">${commonStrings.root.account.accountUpdate.passwordInputNew}</div>`;
    modalForm             .innerHTML += `<input name="new" class="updateAccountModalContentFormInput" type="password" placeholder="${commonStrings.root.account.accountUpdate.passwordInputNew}" required />`;
    modalForm             .innerHTML += `<div class="updateAccountModalContentFormLabel">${commonStrings.root.account.accountUpdate.passwordInputConfirmation}</div>`;
    modalForm             .innerHTML += `<input name="confirm" class="updateAccountModalContentFormInput" type="password" placeholder="${commonStrings.root.account.accountUpdate.passwordInputConfirmation}" required />`;

    modalForm             .addEventListener('submit', updatePasswordCheckFormat);

    modalHeader           .appendChild(modalHeaderTitle);
    modalHeader           .appendChild(modalHeaderClose);
    modalForm             .appendChild(modalFormSubmit);
    modalFormSubmit       .appendChild(modalFormSubmitButton);
    modalContent          .appendChild(modalInfo);
    modalContent          .appendChild(modalForm);
    modal                 .appendChild(modalHeader);
    modal                 .appendChild(modalContent);

    verticalBackground    .appendChild(horizontalBackground);
    horizontalBackground  .appendChild(modal);

    modalHeaderClose      .addEventListener('click', () =>
    {
      checkMessageTag('updatePasswordError');
      document.getElementById('mainContainer').removeAttribute('style');
      verticalBackground.remove();
      veilBackground.remove();
    });

    document.body         .appendChild(veilBackground);
    document.body         .appendChild(verticalBackground);
  });
}

/****************************************************************************************************/

function updatePasswordCheckFormat(event)
{
  event.preventDefault();

  const oldPassword = event.target.elements['old'].value.trim();
  const newPassword = event.target.elements['new'].value.trim();
  const confirmPassword = event.target.elements['confirm'].value.trim();

  checkMessageTag('updatePasswordError');

  if(newPassword !== confirmPassword)
  {
    return displayError(commonStrings.root.account.accountUpdate.passwordDusplicateError, null, 'updatePasswordError');
  }

  return updatePasswordSendToServer(oldPassword, newPassword, confirmPassword);
}

/****************************************************************************************************/

function updatePasswordSendToServer(oldPassword, newPassword, confirmPassword)
{
  document.getElementById('modalBackground').style.display = 'none';

  var loader  = document.createElement('div');

  loader      .setAttribute('class', 'loaderVerticalContainer');
  loader      .innerHTML = '<div class="loaderHorizontalContainer"><div class="loaderSpinner"></div></div>';

  document.body.appendChild(loader);

  $.ajax(
  {
    type: 'PUT', timeout: 10000, dataType: 'JSON', data: { oldPassword: oldPassword, newPassword: newPassword, confirmationPassword: confirmPassword }, url: '/queries/root/account/update-password', success: () => {},
    error: (xhr, status, error) =>
    {
      loader.remove();

      document.getElementById('modalBackground').removeAttribute('style');

      xhr.responseJSON != undefined ?
      displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'updatePasswordError') :
      displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'updatePasswordError');
    }

  }).done((result) =>
  {
    loader.remove();

    document.getElementById('mainContainer').removeAttribute('style');
    document.getElementById('veilBackground').remove();
    document.getElementById('modalBackground').remove();

    displaySuccess(commonStrings.root.account.accountUpdate.passwordSaved, null, 'updatePasswordSuccess');
  });
}

/****************************************************************************************************/
