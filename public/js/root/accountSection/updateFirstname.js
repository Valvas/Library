/****************************************************************************************************/

function updateFirstnameOpenPopup()
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

  modalHeaderTitle      .innerText = commonStrings.root.account.accountUpdate.firstnameLabel;
  modalHeaderClose      .innerText = commonStrings.global.close;
  modalFormSubmitButton .innerText = commonStrings.global.save;

  modalCurrent          .innerHTML += `<div class="updateAccountModalContentCurrentKey">${commonStrings.root.account.accountUpdate.currentValue} :</div><div class="updateAccountModalContentCurrentValue">${accountData.firstname.charAt(0).toUpperCase()}${accountData.firstname.slice(1).toLowerCase()}</div>`;
  modalForm             .innerHTML += `<input name="firstname" class="updateAccountModalContentFormInput" type="text" placeholder="${commonStrings.root.account.accountUpdate.firstnamePlaceholder}" required />`;

  modalForm             .addEventListener('submit', updateFirstnameCheckFormat);

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
    checkMessageTag('updateFirstnameError');
    document.getElementById('mainContainer').removeAttribute('style');
    verticalBackground.remove();
    veilBackground.remove();
  });

  document.body         .appendChild(veilBackground);
  document.body         .appendChild(verticalBackground);
}

/****************************************************************************************************/

function updateFirstnameCheckFormat(event)
{
  event.preventDefault();

  const newFirstname = event.target.elements['firstname'].value;

  checkMessageTag('updateFirstnameError');

  if(newFirstname.toLowerCase() === accountData.firstname.toLowerCase())
  {
    return displayError(commonStrings.root.account.accountUpdate.firstnameDuplicateError, null, 'updateFirstnameError');
  }

  if(new RegExp('^[a-zA-Z]+-?[a-zA-Z]+$').test(newFirstname) == false)
  {
    return displayError(commonStrings.root.account.accountUpdate.firstnameFormatError, null, 'updateFirstnameError');
  }

  return updateFirstnameSendToServer(newFirstname);
}

/****************************************************************************************************/

function updateFirstnameSendToServer(newFirstname)
{
  document.getElementById('modalBackground').style.display = 'none';

  var loader  = document.createElement('div');

  loader      .setAttribute('class', 'loaderVerticalContainer');
  loader      .innerHTML = '<div class="loaderHorizontalContainer"><div class="loaderSpinner"></div></div>';

  document.body.appendChild(loader);

  $.ajax(
  {
    type: 'PUT', timeout: 10000, dataType: 'JSON', data: { firstname: newFirstname }, url: '/queries/root/account/update-firstname', success: () => {},
    error: (xhr, status, error) =>
    {
      loader.remove();

      document.getElementById('modalBackground').removeAttribute('style');

      xhr.responseJSON != undefined ?
      displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'updateFirstnameError') :
      displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'updateFirstnameError');
    }

  }).done((result) =>
  {
    loader.remove();

    document.getElementById('mainContainer').removeAttribute('style');
    document.getElementById('veilBackground').remove();
    document.getElementById('modalBackground').remove();

    if(document.getElementById('accountCurrentFirstname'))
    {
      document.getElementById('accountCurrentFirstname').innerText = `${newFirstname.charAt(0).toUpperCase()}${newFirstname.slice(1).toLowerCase()}`;
    }

    accountData.firstname = `${newFirstname.charAt(0).toUpperCase()}${newFirstname.slice(1).toLowerCase()}`;

    displaySuccess(commonStrings.root.account.accountUpdate.firstnameSaved, null, 'updateFirstnameSuccess');
  });
}

/****************************************************************************************************/
