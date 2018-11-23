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
        removeBackground('createAccountBackground');
        
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

  popup       .setAttribute('class', 'confirmationAccountPopup');
  buttons     .setAttribute('class', 'confirmationAccountPopupButtons');
  confirm     .setAttribute('class', 'confirmationAccountPopupSave');
  cancel      .setAttribute('class', 'confirmationAccountPopupCancel');

  popup       .innerHTML += `<div class="confirmationAccountPopupTitle">${administrationAppStrings.accountsCreate.confirmationPopup.title}</div>`;
  popup       .innerHTML += `<div class="confirmationAccountPopupMessage">${administrationAppStrings.accountsCreate.confirmationPopup.message}</div>`;

  confirm     .innerText = administrationAppStrings.accountsCreate.confirmationPopup.confirm;
  cancel      .innerText = administrationAppStrings.accountsCreate.confirmationPopup.cancel;

  confirm     .addEventListener('click', sendAccountDataToServer);

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

function sendAccountDataToServer()
{
  if(document.getElementById('emailInput') == null) return;
  if(document.getElementById('lastnameInput') == null) return;
  if(document.getElementById('firstnameInput') == null) return;

  const accountEmail      = document.getElementById('emailInput').value.toLowerCase();
  const accountLastname   = document.getElementById('lastnameInput').value.toLowerCase();
  const accountFirstname  = document.getElementById('firstnameInput').value.toLowerCase();

  if(document.getElementById('createAccountPopup')) document.getElementById('createAccountPopup').remove();

  displayLoader(administrationAppStrings.accountsCreate.savingLoaderMessage, (loader) =>
  {
    $.ajax(
    {
      method: 'POST', dataType: 'json', timeout: 120000, data: { accountEmail: accountEmail, accountLastname: accountLastname, accountFirstname: accountFirstname }, url: '/queries/administration/accounts/create-account',

      error: (xhr, textStatus, errorThrown) =>
      {
        removeLoader(loader, () => {  });

        removeBackground('createAccountBackground');

        xhr.responseJSON != undefined
        ? displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'createAccountError')
        : displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'createAccountError');
      }

    }).done((result) =>
    {
      removeLoader(loader, () => {  });

      removeBackground('createAccountBackground');

      displaySuccess(result.message, null, 'createAccountSuccess');
    });
  });
}

/****************************************************************************************************/