/****************************************************************************************************/

function openAccountRightsPanel(accountUuid)
{
  var spinner            = document.createElement('div');
  var background         = document.createElement('div');

  spinner                .setAttribute('class', 'storageSpinner');
  background             .setAttribute('class', 'storageBackground');

  spinner                .innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';

  document.body          .appendChild(background);
  document.body          .appendChild(spinner);

  var accounts = document.getElementById('rightsOnServicesHomeMembersBlockListAccounts').children;

  for(var x = 0; x < accounts.length; x++)
  {
    accounts[x].getAttribute('name') === accountUuid
    ? accounts[x].style.color = '#428BCA'
    : accounts[x].style.color = null;
  }

  closeAccountRightsPanel(() =>
  {
    $.ajax(
    {
      method: 'GET', dataType: 'json', timeout: 5000, url: '/queries/storage/strings',
  
      error: (xhr, textStatus, errorThrown) =>
      {
        spinner.remove();
        background.remove();
  
        xhr.responseJSON != undefined ?
        displayErrorMessage(xhr.responseJSON.message, xhr.responseJSON.detail) :
        displayErrorMessage('Une erreur est survenue, veuillez réessayer plus tard', null);
      }
    }).done((json) =>
    {
      const strings = json.strings;

      $.ajax(
      {
        method: 'PUT', dataType: 'json', timeout: 5000, url: '/queries/storage/services/get-account-rights-for-service', data: { serviceUuid: document.getElementById('rightsOnServicesHomeMembersBlock').getAttribute('name'), accountUuid: accountUuid },
    
        error: (xhr, textStatus, errorThrown) =>
        {
          spinner.remove();
          background.remove();
    
          xhr.responseJSON != undefined ?
          displayErrorMessage(xhr.responseJSON.message, xhr.responseJSON.detail) :
          displayErrorMessage('Une erreur est survenue, veuillez réessayer plus tard', null);
        }
      }).done((json) =>
      {
        const rights = json.rights;

        spinner.remove();
        background.remove();

        var accountRightsPanel        = document.createElement('div');
        var accountRightsPanelList    = document.createElement('div');
        var accountRightsPanelRemove  = document.createElement('button');
        var accountRightsPanelSave    = document.createElement('button');
        var accountRightsPanelClose   = document.createElement('button');

        accountRightsPanel            .setAttribute('id', 'accountRightsPanel');
        accountRightsPanelList        .setAttribute('id', 'accountRightsPanelList');

        accountRightsPanel            .setAttribute('name', accountUuid);

        accountRightsPanel            .setAttribute('class', 'accountRightsPanel');
        accountRightsPanelList        .setAttribute('class', 'accountRightsPanelList');
        accountRightsPanelRemove      .setAttribute('class', 'accountRightsPanelRemove');
        accountRightsPanelSave        .setAttribute('class', 'accountRightsPanelSave');
        accountRightsPanelClose       .setAttribute('class', 'accountRightsPanelClose');

        accountRightsPanelRemove      .addEventListener('click', () => { removeMemberFromService(accountUuid, strings); });

        accountRightsPanelSave        .addEventListener('click', updateMemberRights);

        accountRightsPanelClose       .addEventListener('click', () => 
        { 
          closeAccountRightsPanel(() => 
          {
            var accounts = document.getElementById('rightsOnServicesHomeMembersBlockListAccounts').children;

            for(var x = 0; x < accounts.length; x++)
            {
              accounts[x].style.color = null;
            }
          }); 
        });

        for(var key in rights)
        {
          if(key !== 'service')
          {
            rights[key]
            ? accountRightsPanelList.innerHTML += `<div name="${key}" class="accountRightsPanelListElement"><input class="accountRightsPanelListElementCheckbox" type="checkbox" checked /><div class="accountRightsPanelListElementValue">${strings.admin.servicesRights.accountRightsBlock.list[key]}</div></div>`
            : accountRightsPanelList.innerHTML += `<div name="${key}" class="accountRightsPanelListElement"><input class="accountRightsPanelListElementCheckbox" type="checkbox" /><div class="accountRightsPanelListElementValue">${strings.admin.servicesRights.accountRightsBlock.list[key]}</div></div>`;
          }
        }

        accountRightsPanelRemove      .innerText = strings.admin.servicesRights.accountRightsBlock.remove;
        accountRightsPanelSave        .innerText = strings.admin.servicesRights.accountRightsBlock.save;
        accountRightsPanelClose       .innerText = strings.admin.servicesRights.accountRightsBlock.close;

        accountRightsPanel            .innerHTML += `<div class="accountRightsPanelTitle">${strings.admin.servicesRights.accountRightsBlock.title}</div>`;

        accountRightsPanel            .appendChild(accountRightsPanelRemove);
        accountRightsPanel            .appendChild(accountRightsPanelList);
        accountRightsPanel            .appendChild(accountRightsPanelSave);
        accountRightsPanel            .appendChild(accountRightsPanelClose);

        $(accountRightsPanel)         .hide().appendTo(document.getElementById('mainBlock'));

        $(accountRightsPanel).toggle('slide', { direction: 'up' }, 250);
      });
    });
  });
}

/****************************************************************************************************/

function closeAccountRightsPanel(callback)
{
  if(document.getElementById('accountRightsPanel'))
  {
    $(document.getElementById('accountRightsPanel')).toggle('slide', { direction: 'up' }, 250, () =>
    {
      document.getElementById('accountRightsPanel').remove();

      return callback();
    });
  }

  else
  {
    return callback();
  }
}

/****************************************************************************************************/

function removeMemberFromService(accountUuid, strings)
{
  var background          = document.createElement('div');
  var prompt              = document.createElement('div');
  var promptTitle         = document.createElement('div');
  var promptMessage       = document.createElement('div');
  var promptYesButton     = document.createElement('button');
  var promptNoButton      = document.createElement('button');

  background              .setAttribute('id', 'removeMemberFromServiceBackground');
  prompt                  .setAttribute('id', 'removeMemberFromServicePrompt');

  background              .setAttribute('class', 'storageBackground');
  prompt                  .setAttribute('class', 'storagePopup');
  promptTitle             .setAttribute('class', 'storagePopupTitle');
  promptMessage           .setAttribute('class', 'storagePopupMessage');
  promptYesButton         .setAttribute('class', 'promptYesButton');
  promptNoButton          .setAttribute('class', 'promptNoButton');

  promptYesButton         .addEventListener('click', () => { sendRemoveRequest(accountUuid) });
  promptNoButton          .addEventListener('click', closeRemoveMemberPrompt);

  promptTitle             .innerText = strings.admin.servicesRights.accountRightsBlock.prompt.title;
  promptMessage           .innerText = strings.admin.servicesRights.accountRightsBlock.prompt.message;
  promptYesButton         .innerText = strings.admin.servicesRights.accountRightsBlock.prompt.yes;
  promptNoButton          .innerText = strings.admin.servicesRights.accountRightsBlock.prompt.no;

  prompt                  .appendChild(promptTitle);
  prompt                  .appendChild(promptMessage);
  prompt                  .appendChild(promptYesButton);
  prompt                  .appendChild(promptNoButton);

  document.body           .appendChild(background);
  document.body           .appendChild(prompt);

  promptNoButton.focus();
}

/****************************************************************************************************/

function closeRemoveMemberPrompt()
{
  if(document.getElementById('removeMemberFromServicePrompt')) document.getElementById('removeMemberFromServicePrompt').remove();
  if(document.getElementById('removeMemberFromServiceBackground')) document.getElementById('removeMemberFromServiceBackground').remove();
}

/****************************************************************************************************/

function sendRemoveRequest(accountUuid)
{
  var accountUuids = [];

  if(document.getElementById('removeMemberFromServicePrompt')) document.getElementById('removeMemberFromServicePrompt').remove();
  if(document.getElementById('removeMemberFromServiceBackground')) document.getElementById('removeMemberFromServiceBackground').remove();

  var spinner            = document.createElement('div');
  var background         = document.createElement('div');

  spinner                .setAttribute('class', 'storageSpinner');
  background             .setAttribute('class', 'storageBackground');

  spinner                .innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';

  document.body          .appendChild(background);
  document.body          .appendChild(spinner);

  accountUuids.push(accountUuid);
  
  $.ajax(
  {
    method: 'DELETE', dataType: 'json', timeout: 5000, url: '/queries/storage/admin/remove-access-to-a-service', data: { serviceUuid: document.getElementById('rightsOnServicesHomeMembersBlock').getAttribute('name'), accountUuids: JSON.stringify(accountUuids) },

    error: (xhr, textStatus, errorThrown) =>
    {
      spinner.remove();
      background.remove();

      xhr.responseJSON != undefined ?
      displayErrorMessage(xhr.responseJSON.message, xhr.responseJSON.detail) :
      displayErrorMessage('Une erreur est survenue, veuillez réessayer plus tard', null);
    }
  }).done((json) =>
  {
    spinner.remove();
    background.remove();

    socket.emit('storageAppAdminServicesRightsAccountRemovedFromMembers', accountUuid, document.getElementById('rightsOnServicesHomeMembersBlock').getAttribute('name'));

    displaySuccessMessage(json.message, null);
  });
}

/****************************************************************************************************/

function updateMemberRights(event)
{
  if(document.getElementById('accountRightsPanel'))
  {
    var spinner            = document.createElement('div');
    var background         = document.createElement('div');

    spinner                .setAttribute('class', 'storageSpinner');
    background             .setAttribute('class', 'storageBackground');

    spinner                .innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';

    document.body          .appendChild(background);
    document.body          .appendChild(spinner);

    const accountUuid = document.getElementById('accountRightsPanel').getAttribute('name');
    const serviceUuid = document.getElementById('rightsOnServicesHomeMembersBlock').getAttribute('name');

    var rightsObject = {};

    const listRights = document.getElementById('accountRightsPanelList').children;

    for(var x = 0; x < listRights.length; x++)
    {
      rightsObject[listRights[x].getAttribute('name')] = listRights[x].children[0].checked == true;
    }

    $.ajax(
    {
      method: 'PUT', dataType: 'json', timeout: 5000, url: '/queries/storage/admin/update-rights-on-service', data: { serviceUuid: serviceUuid, accountUuid: accountUuid, rightsObject: JSON.stringify(rightsObject) },
  
      error: (xhr, textStatus, errorThrown) =>
      {
        spinner.remove();
        background.remove();
  
        xhr.responseJSON != undefined ?
        displayErrorMessage(xhr.responseJSON.message, xhr.responseJSON.detail) :
        displayErrorMessage('Une erreur est survenue, veuillez réessayer plus tard', null);
      }
    }).done((json) =>
    {
      spinner.remove();
      background.remove();

      socket.emit('accountRightsUpdatedOnService', accountUuid, rightsObject, serviceUuid);
  
      displaySuccessMessage(json.message, null);
    });
  }
}

/****************************************************************************************************/