/****************************************************************************************************/

var administrationAppStrings = null;

const accounts = document.getElementsByName('accountBlock');

for(var x = 0; x < accounts.length; x++)
{
  const currentAccountUuid = accounts[x].getAttribute('id');

  accounts[x].children[4].children[0].addEventListener('click', () => { launchRemoveAccountProcess(currentAccountUuid) });
}

/****************************************************************************************************/

function launchRemoveAccountProcess(currentAccountUuid)
{
  if(document.getElementById('removeAccountBackground')) return;

  createBackground('removeAccountBackground');

  displayLoader('', (loader) =>
  {
    if(administrationAppStrings != null) return openRemoveAccountConfirmationPopup(currentAccountUuid, loader);

    getAdministrationAppStrings((error, strings) =>
    {
      if(error != null)
      {
        removeBackground('removeAccountBackground');

        return displayError(error.message, error.detail, 'removeAccountError');
      }

      administrationAppStrings = strings;

      return openRemoveAccountConfirmationPopup(currentAccountUuid, loader);
    });
  });
}

/****************************************************************************************************/

function openRemoveAccountConfirmationPopup(currentAccountUuid, loader)
{
  removeLoader(loader, () =>
  {
    removeBackground('removeAccountBackground');
    
    displayInfo('Cette fonctionnalité n\'est pas encore implémentée', null, 'removeAccountInfo');
  });
}

/****************************************************************************************************/