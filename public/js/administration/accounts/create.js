/****************************************************************************************************/

var administrationAppStrings = null;

if(document.getElementById('createAccountForm')) document.getElementById('createAccountForm').addEventListener('submit', sendFormData);

/****************************************************************************************************/

function sendFormData(event)
{
  event.preventDefault();

  if(document.getElementById('createAccountBackground')) return;

  if(document.getElementById('emailInput') == null) return;
  if(document.getElementById('emailError') == null) return;
  if(document.getElementById('lastnameInput') == null) return;
  if(document.getElementById('lastnameError') == null) return;
  if(document.getElementById('firstnameInput') == null) return;
  if(document.getElementById('firstnameError') == null) return;

  document.getElementById('emailError').removeAttribute('style');
  document.getElementById('lastnameError').removeAttribute('style');
  document.getElementById('firstnameError').removeAttribute('style');

  if(new RegExp('^[a-zA-Z][\\w\\.-]*[a-zA-Z0-9]@[a-zA-Z0-9][\\w\\.-]*[a-zA-Z0-9]\\.[a-zA-Z][a-zA-Z\\.]*[a-zA-Z]$').test(document.getElementById('emailInput').value) == false)
  {
    document.getElementById('emailError').style.display = 'block';
    return;
  }
  
  if(new RegExp('^[a-zéàèâêîôûäëïöüñ]+(-)?[a-zéàèâêîôûäëïöüñ]+$').test(document.getElementById('lastnameInput').value.toLowerCase()) == false)
  {
    document.getElementById('lastnameError').style.display = 'block';
    return;
  }

  if(new RegExp('^[a-zéàèâêîôûäëïöüñ]+(-)?[a-zéàèâêîôûäëïöüñ]+$').test(document.getElementById('firstnameInput').value.toLowerCase()) == false)
  {
    document.getElementById('firstnameError').style.display = 'block';
    return;
  }

  createBackground('createAccountBackground');

  displayLoader('', (loader) =>
  {
    if(administrationAppStrings != null) return openConfirmationPopup(loader);

    getAdministrationAppStrings((error, strings) =>
    {
      if(error != null)
      {
        displayError(error.message, error.detail, 'createFormError');
        return;
      }

      administrationAppStrings = strings;

      return openConfirmationPopup(loader);
    });
  })
}

/****************************************************************************************************/

function openConfirmationPopup(loader)
{
  var popup   = document.createElement('div');
  var buttons = document.createElement('div');
  var confirm = document.createElement('button');
  var cancel  = document.createElement('button');

  popup       .setAttribute('id', 'createAccountPopup');

  popup       .setAttribute('class', 'createAccountPopup');
  buttons     .setAttribute('class', 'createAccountPopupButtons');
  confirm     .setAttribute('class', 'createAccountPopupSave');
  cancel      .setAttribute('class', 'createAccountPopupCancel');

  popup       .innerHTML += `<div class="createAccountPopupTitle">${administrationAppStrings.accountsCreate.confirmationPopup.title}</div>`;
  popup       .innerHTML += `<div class="createAccountPopupMessage">${administrationAppStrings.accountsCreate.confirmationPopup.message}</div>`;

  confirm     .innerText = administrationAppStrings.accountsCreate.confirmationPopup.confirm;
  cancel      .innerText = administrationAppStrings.accountsCreate.confirmationPopup.cancel;

  cancel      .addEventListener('click', () =>
  {
    popup.remove();
    removeBackground('createAccountBackground');
  });

  buttons     .appendChild(confirm);
  buttons     .appendChild(cancel);
  popup       .appendChild(buttons);

  document.body.appendChild(popup);

  removeLoader(loader, () => {  });
}

/****************************************************************************************************/