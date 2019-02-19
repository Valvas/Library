/****************************************************************************************************/

function updateLastnameOpenPopup()
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

  modalHeaderTitle      .innerText = commonStrings.root.account.accountUpdate.lastnameLabel;
  modalHeaderClose      .innerText = commonStrings.global.close;
  modalFormSubmitButton .innerText = commonStrings.global.save;

  modalCurrent          .innerHTML += `<div class="updateAccountModalContentCurrentKey">${commonStrings.root.account.accountUpdate.currentValue} :</div><div class="updateAccountModalContentCurrentValue">${accountData.lastname.charAt(0).toUpperCase()}${accountData.lastname.slice(1).toLowerCase()}</div>`;
  modalForm             .innerHTML += `<input name="lastname" class="updateAccountModalContentFormInput" type="text" placeholder="${commonStrings.root.account.accountUpdate.lastnamePlaceholder}" required />`;

  modalForm             .addEventListener('submit', updateLastnameCheckFormat);

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
    checkMessageTag('updateLastnameError');
    document.getElementById('mainContainer').removeAttribute('style');
    verticalBackground.remove();
    veilBackground.remove();
  });

  document.body         .appendChild(veilBackground);
  document.body         .appendChild(verticalBackground);
}

/****************************************************************************************************/

function updateLastnameCheckFormat(event)
{
  event.preventDefault();

  const newLastname = event.target.elements['lastname'].value;

  checkMessageTag('updateLastnameError');

  if(newLastname.toLowerCase() === accountData.lastname.toLowerCase())
  {
    return displayError(commonStrings.root.account.accountUpdate.lastnameDuplicateError, null, 'updateLastnameError');
  }

  if(new RegExp('^[a-zA-Z]+-?[a-zA-Z]+$').test(newLastname) == false)
  {
    return displayError(commonStrings.root.account.accountUpdate.lastnameFormatError, null, 'updateLastnameError');
  }

  return updateLastnameSendToServer(newLastname);
}

/****************************************************************************************************/

function updateLastnameSendToServer(newLastname)
{
  document.getElementById('modalBackground').style.display = 'none';

  var loader  = document.createElement('div');

  loader      .setAttribute('class', 'loaderVerticalContainer');
  loader      .innerHTML = '<div class="loaderHorizontalContainer"><div class="loaderSpinner"></div></div>';

  document.body.appendChild(loader);

  $.ajax(
  {
    type: 'PUT', timeout: 10000, dataType: 'JSON', data: { lastname: newLastname }, url: '/queries/root/account/update-lastname', success: () => {},
    error: (xhr, status, error) =>
    {
      loader.remove();

      document.getElementById('modalBackground').removeAttribute('style');

      xhr.responseJSON != undefined ?
      displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'updateLastnameError') :
      displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'updateLastnameError');
    }

  }).done((result) =>
  {
    loader.remove();

    document.getElementById('mainContainer').removeAttribute('style');
    document.getElementById('veilBackground').remove();
    document.getElementById('modalBackground').remove();

    if(document.getElementById('accountCurrentLastname'))
    {
      document.getElementById('accountCurrentLastname').innerText = `${newLastname.charAt(0).toUpperCase()}${newLastname.slice(1).toLowerCase()}`;
    }

    accountData.lastname = `${newLastname.charAt(0).toUpperCase()}${newLastname.slice(1).toLowerCase()}`;

    displaySuccess(commonStrings.root.account.accountUpdate.lastnameSaved, null, 'updateLastnameSuccess');
  });
}

/****************************************************************************************************/
