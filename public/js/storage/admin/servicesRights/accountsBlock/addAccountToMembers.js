/****************************************************************************************************/

function addAccountToMembers(accountUuid)
{
  var accountUuids = [];

  accountUuids.push(accountUuid);

  var background    = document.createElement('div');
  var popup         = document.createElement('div');
  var spinner       = document.createElement('div');

  background        .setAttribute('class', 'accountsBlockLoadingBackground');
  popup             .setAttribute('class', 'accountsBlockLoadingPopup');
  spinner           .setAttribute('class', 'accountsBlockLoadingSpinner');

  spinner           .innerHTML = '<i class="fas fa-circle-notch fa-spin fa-4x"></i>';

  popup             .appendChild(spinner);

  document.body     .appendChild(background);
  document.body     .appendChild(popup);

  $.ajax(
  {
    method: 'POST',
    dataType: 'json',
    data: { accountUuids: JSON.stringify(accountUuids), serviceUuid: document.getElementById('rightsOnServicesHomeMembersBlock').getAttribute('name') },
    timeout: 5000,
    url: '/queries/storage/admin/give-access-to-a-service',

    error: (xhr, textStatus, errorThrown) =>
    {
      popup.remove();
      background.remove();

      xhr.responseJSON != undefined ?
      displayErrorMessage(xhr.responseJSON.message, xhr.responseJSON.detail) :
      displayErrorMessage('Une erreur est survenue, veuillez réessayer plus tard', null);
    }

  }).done((json) =>
  {
    socket.emit('storageAppAdminServicesRightsAccountAddedToMembers', accountUuid);

    popup.remove();
    background.remove();

    displaySuccessMessage(json.message, null);
  });
}

/****************************************************************************************************/

function addMultipleAccountsToMembers()
{
  var background    = document.createElement('div');
  var popup         = document.createElement('div');
  var spinner       = document.createElement('div');

  background        .setAttribute('class', 'accountsBlockLoadingBackground');
  popup             .setAttribute('class', 'accountsBlockLoadingPopup');
  spinner           .setAttribute('class', 'accountsBlockLoadingSpinner');

  spinner           .innerHTML = '<i class="fas fa-circle-notch fa-spin fa-4x"></i>';

  popup             .appendChild(spinner);

  document.body     .appendChild(background);
  document.body     .appendChild(popup);

  document.getElementById('rightsOnServicesHomeAccountsBlockSelectAll').checked = false;
  document.getElementById('rightsOnServicesHomeAccountsBlockSelectAll').indeterminate = false;

  document.getElementById('rightsOnServicesHomeAccountsBlockAdd').innerText = document.getElementById('rightsOnServicesHomeAccountsBlockAdd').innerText.split(' ')[0] + ' (0)';

  var accounts = document.getElementById('rightsOnServicesHomeAccountsBlockListElements').children;

  var accountsToAdd = [];

  for(var x = 0; x < accounts.length; x++)
  {
    if(accounts[x].children[0].children[0].checked == true) accountsToAdd.push(accounts[x].getAttribute('id'));
  }

  $.ajax(
  {
    method: 'POST',
    dataType: 'json',
    data: { accountUuids: JSON.stringify(accountsToAdd), serviceUuid: document.getElementById('rightsOnServicesHomeMembersBlock').getAttribute('name') },
    timeout: 5000,
    url: '/queries/storage/admin/give-access-to-a-service',

    error: (xhr, textStatus, errorThrown) =>
    {
      popup.remove();
      background.remove();

      xhr.responseJSON != undefined ?
      displayErrorMessage(xhr.responseJSON.message, xhr.responseJSON.detail) :
      displayErrorMessage('Une erreur est survenue, veuillez réessayer plus tard', null);
    }

  }).done((json) =>
  {
    popup.remove();
    background.remove();

    for(var x = 0; x < accountsToAdd.length; x++)
    {
      socket.emit('storageAppAdminServicesRightsAccountAddedToMembers', accountsToAdd[x]);
    }

    displaySuccessMessage(json.message, null);
  });
}

/****************************************************************************************************/