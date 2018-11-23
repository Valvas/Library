/****************************************************************************************************/

var administrationAppStrings = null;

if(document.getElementById('exitLink')) document.getElementById('exitLink').addEventListener('click', launchExitProcess);

/****************************************************************************************************/

function launchExitProcess(event)
{
  if(document.getElementById('exitBackground')) return;

  createBackground('exitBackground');

  displayLoader('', (loader) =>
  {
    if(administrationAppStrings != null) return openExitConfirmationPopup(loader);

    getAdministrationAppStrings((error, strings) =>
    {
      if(error != null)
      {
        removeBackground('exitBackground');
        
        return displayError(error.message, error.detail, 'exitError');
      }

      administrationAppStrings = strings;

      return openExitConfirmationPopup(loader);
    });
  });
}

/****************************************************************************************************/

function openExitConfirmationPopup(loader)
{
  var popup   = document.createElement('div');
  var buttons = document.createElement('div');
  var confirm = document.createElement('button');
  var cancel  = document.createElement('button');

  popup       .setAttribute('id', 'suspendAccountPopup');

  popup       .setAttribute('class', 'confirmationAccountPopup');
  buttons     .setAttribute('class', 'confirmationAccountPopupButtons');
  confirm     .setAttribute('class', 'confirmationAccountPopupSave');
  cancel      .setAttribute('class', 'confirmationAccountPopupCancel');

  popup       .innerHTML += `<div class="confirmationAccountPopupTitle">${administrationAppStrings.exitPopup.title}</div>`;
  popup       .innerHTML += `<div class="confirmationAccountPopupMessage">${administrationAppStrings.exitPopup.message}</div>`

  confirm     .innerText = administrationAppStrings.exitPopup.confirm;
  cancel      .innerText = administrationAppStrings.exitPopup.cancel;

  confirm     .addEventListener('click', () =>
  {
    location = '/home';
  });

  cancel      .addEventListener('click', () =>
  {
    popup.remove();
    removeBackground('exitBackground');
  });

  buttons     .appendChild(confirm);
  buttons     .appendChild(cancel);
  popup       .appendChild(buttons);

  document.body.appendChild(popup);

  removeLoader(loader, () => {  });
}

/****************************************************************************************************/