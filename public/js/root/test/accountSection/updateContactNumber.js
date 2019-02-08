/****************************************************************************************************/

function updateContactNumberOpenPopup()
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

  modalHeaderTitle      .innerText = commonStrings.root.account.accountUpdate.contactNumberLabel;
  modalHeaderClose      .innerText = commonStrings.global.close;
  modalFormSubmitButton .innerText = commonStrings.global.save;

  modalCurrent          .innerHTML += `<div class="updateAccountModalContentCurrentKey">${commonStrings.root.account.accountUpdate.currentValue} :</div><div class="updateAccountModalContentCurrentValue">+${accountData.contactNumber}</div>`;
  modalForm             .innerHTML += `<div class="updateAccountModalContentFormLabel">${commonStrings.root.account.accountUpdate.contactNumberIndicativeLabel}</div>`;
  modalForm             .innerHTML += `<select name="indicative" class="updateAccountModalContentFormInput"><option value="33">33</option></select>`;
  modalForm             .innerHTML += `<div class="updateAccountModalContentFormLabel">${commonStrings.root.account.accountUpdate.contactNumberContentLabel}</div>`;
  modalForm             .innerHTML += `<input name="contact" class="updateAccountModalContentFormInput" type="phone" placeholder="${commonStrings.root.account.accountUpdate.contactNumberPlaceholder}" required />`;

  modalForm             .addEventListener('submit', updateContactNumberCheckFormat);

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
    checkMessageTag('updateContactError');
    document.getElementById('mainContainer').removeAttribute('style');
    verticalBackground.remove();
    veilBackground.remove();
  });

  document.body         .appendChild(veilBackground);
  document.body         .appendChild(verticalBackground);
}

/****************************************************************************************************/

function updateContactNumberCheckFormat(event)
{
  event.preventDefault();

  const newContactNumber  = `${event.target.elements['indicative'].options[event.target.elements['indicative'].selectedIndex].value}${event.target.elements['contact'].value.replace(/\s/g,'')}`;

  checkMessageTag('updateContactError');

  if(newContactNumber === accountData.contactNumber)
  {
    return displayError(commonStrings.root.account.accountUpdate.contactNumberDuplicateError, null, 'updateContactError');
  }

  if(new RegExp('^[0-9]+$').test(newContactNumber) == false)
  {
    return displayError(commonStrings.root.account.accountUpdate.contactNumberFormatError, null, 'updateContactError');
  }

  return updateContactNumberSendToServer(newContactNumber);
}

/****************************************************************************************************/

function updateContactNumberSendToServer(newContactNumber)
{
  document.getElementById('modalBackground').style.display = 'none';

  var loader  = document.createElement('div');

  loader      .setAttribute('class', 'loaderVerticalContainer');
  loader      .innerHTML = '<div class="loaderHorizontalContainer"><div class="loaderSpinner"></div></div>';

  document.body.appendChild(loader);

  $.ajax(
  {
    type: 'PUT', timeout: 10000, dataType: 'JSON', data: { number: newContactNumber }, url: '/queries/root/account/update-contact-number', success: () => {},
    error: (xhr, status, error) =>
    {
      loader.remove();

      document.getElementById('modalBackground').removeAttribute('style');

      xhr.responseJSON != undefined ?
      displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'updateContactError') :
      displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'updateContactError');
    }

  }).done((result) =>
  {
    loader.remove();

    document.getElementById('mainContainer').removeAttribute('style');
    document.getElementById('veilBackground').remove();
    document.getElementById('modalBackground').remove();

    if(document.getElementById('accountCurrentContactNumber'))
    {
      document.getElementById('accountCurrentContactNumber').innerText = `+${newContactNumber}`;
    }

    accountData.contactNumber = newContactNumber;

    displaySuccess(commonStrings.root.account.accountUpdate.contactNumberUpdated, null, 'updateContactSuccess');
  });
}

/****************************************************************************************************/
