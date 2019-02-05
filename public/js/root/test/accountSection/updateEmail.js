/****************************************************************************************************/

function updateEmailOpenPopup()
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
  var modalCurrent          = document.createElement('div');
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
  modalCurrent          .setAttribute('class', 'updateAccountModalContentCurrent');
  modalForm             .setAttribute('class', 'updateAccountModalContentForm');
  modalFormSubmit       .setAttribute('class', 'updateAccountModalContentFormSubmit');
  modalFormSubmitButton .setAttribute('class', 'updateAccountModalContentFormSubmitButton');

  modalHeaderTitle      .innerText = commonStrings.root.account.accountUpdate.emailLabel;
  modalHeaderClose      .innerText = commonStrings.global.close;
  modalFormSubmitButton .innerText = commonStrings.global.save;

  modalCurrent          .innerHTML += `<div class="updateAccountModalContentCurrentKey">${commonStrings.root.account.accountUpdate.currentValue} :</div><div class="updateAccountModalContentCurrentValue">${accountData.email}</div>`;
  modalForm             .innerHTML += `<input name="email" class="updateAccountModalContentFormInput" type="email" placeholder="${commonStrings.root.account.accountUpdate.emailPlaceholder}" required />`;

  modalForm             .addEventListener('submit', updateEmailCheckFormat);

  modalHeader           .appendChild(modalHeaderTitle);
  modalHeader           .appendChild(modalHeaderClose);
  modalForm             .appendChild(modalFormSubmit);
  modalFormSubmit       .appendChild(modalFormSubmitButton);
  modalContent          .appendChild(modalCurrent);
  modalContent          .appendChild(modalForm);
  modal                 .appendChild(modalHeader);
  modal                 .appendChild(modalContent);

  verticalBackground    .appendChild(horizontalBackground);
  horizontalBackground  .appendChild(modal);

  modalHeaderClose      .addEventListener('click', () =>
  {
    checkMessageTag('updateEmailError');
    document.getElementById('mainContainer').removeAttribute('style');
    verticalBackground.remove();
    veilBackground.remove();
  });

  document.body         .appendChild(veilBackground);
  document.body         .appendChild(verticalBackground);
}

/****************************************************************************************************/

function updateEmailCheckFormat(event)
{
  event.preventDefault();

  const newEmail = event.target.elements['email'].value;

  checkMessageTag('updateEmailError');

  if(newEmail.toLowerCase() === accountData.email.toLowerCase())
  {
    return displayError(commonStrings.root.account.accountUpdate.emailDuplicateError, null, 'updateEmailError');
  }

  if(new RegExp('^[a-zA-Z][\\w\\.-]*[a-zA-Z0-9]@[a-zA-Z0-9][\\w\\.-]*[a-zA-Z0-9]\\.[a-zA-Z][a-zA-Z\\.]*[a-zA-Z]$').test(newEmail) == false)
  {
    return displayError(commonStrings.root.account.accountUpdate.emailFormatError, null, 'updateEmailError');
  }

  return updateEmailSendToServer(newEmail);
}

/****************************************************************************************************/

function updateEmailSendToServer(newEmail)
{
  document.getElementById('modalBackground').style.display = 'none';

  var loader  = document.createElement('div');

  loader      .setAttribute('class', 'loaderVerticalContainer');
  loader      .innerHTML = '<div class="loaderHorizontalContainer"><div class="loaderSpinner"></div></div>';

  document.body.appendChild(loader);

  $.ajax(
  {
    type: 'PUT', timeout: 10000, dataType: 'JSON', data: { emailAddress: newEmail }, url: '/queries/root/account/update-email-address', success: () => {},
    error: (xhr, status, error) =>
    {
      loader.remove();

      document.getElementById('modalBackground').removeAttribute('style');

      xhr.responseJSON != undefined ?
      displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'updateEmailError') :
      displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'updateEmailError');
    }

  }).done((result) =>
  {
    loader.remove();

    document.getElementById('mainContainer').removeAttribute('style');
    document.getElementById('veilBackground').remove();
    document.getElementById('modalBackground').remove();

    if(document.getElementById('accountCurrentEmail'))
    {
      document.getElementById('accountCurrentEmail').innerText = newEmail.toLowerCase();
    }

    if(document.getElementById('navigationBarAccountEmail'))
    {
      document.getElementById('navigationBarAccountEmail').innerText = newEmail.toLowerCase();
    }

    accountData.email = newEmail.toLowerCase();

    displaySuccess(commonStrings.root.account.accountUpdate.emailSaved, null, 'updateEmailSuccess');
  });
}

/****************************************************************************************************/
