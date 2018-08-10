/****************************************************************************************************/

var socket = io();

/****************************************************************************************************/

socket.on('connect', () =>
{
  socket.emit('storageAppAdminServicesRightsJoin');
});

/****************************************************************************************************/

socket.on('accountAddedToMembers', (accountUuid) =>
{
  $.ajax(
  {
    method: 'GET', dataType: 'json', timeout: 2000, url: '/queries/storage/strings',

    error: (xhr, textStatus, errorThrown) => {  }

  }).done((json) =>
  {
    const strings = json.strings;

    $.ajax(
    {
      method: 'PUT', dataType: 'json', data: { accountUuid: accountUuid }, timeout: 2000, url: '/queries/accounts/get-account-from-uuid',
  
      error: (xhr, textStatus, errorThrown) => {  }
  
    }).done((json) =>
    {
      const account = json.account;

      if(document.getElementById('rightsOnServicesHomeAccountsBlock'))
      {
        var accounts = document.getElementById('rightsOnServicesHomeAccountsBlockListElements').children;
        var pageSelectors = document.getElementById('rightsOnServicesHomeAccountsBlockListPages').children;

        for(var x = 0; x < accounts.length; x++)
        {
          if(accounts[x].getAttribute('id') === accountUuid)
          {
            accounts[x].remove();

            break;
          }
        }

        for(var x = 0; x < pageSelectors.length; x++)
        {
          if(pageSelectors[x].getAttribute('class') === 'accountsBlockListPagesElementSelected')
          {
            updateAccountsBlockPages(pageSelectors[x].getAttribute('tag'));

            break;
          }
        }
      }

      checkIfAccountAlreadyExists(accountUuid, (error, alreadyExists) =>
      {
        if(alreadyExists == false) addAccountToMembersBlock(account, strings);
      });
    });
  });
});

/****************************************************************************************************/

function checkIfAccountAlreadyExists(accountUuid, callback)
{
  var accounts = document.getElementById('rightsOnServicesHomeMembersBlockListAccounts').children;

  for(var x = 0; x < accounts.length; x++)
  {
    if(accounts[x].getAttribute('name') === accountUuid) return callback(null, true);
  }

  return callback(null, false);
}

/****************************************************************************************************/

function addAccountToMembersBlock(account, strings)
{
  if(document.getElementById('rightsOnServicesHomeMembersBlockEmpty')) document.getElementById('rightsOnServicesHomeMembersBlockEmpty').style.display = 'none';

  var amountOfAccounts = document.getElementById('rightsOnServicesHomeMembersBlockListAccounts').children.length;

  var accountRow            = document.createElement('div');

  accountRow                .setAttribute('tag', Math.floor(amountOfAccounts / 10));
  accountRow                .setAttribute('class', 'membersBlockListAccountsElement');
  accountRow                .setAttribute('name', account.uuid);

  accountRow                .addEventListener('click', () => { openAccountRightsPanel(account.uuid) });

  accountRow.innerHTML = '<div class="membersBlockListAccountsElementLabelsEmail">' + account.email + '</div><div class="membersBlockListAccountsElementLabelsLastname">' + account.lastname.toUpperCase() + '</div><div class="membersBlockListAccountsElementLabelsFirstname">' + account.firstname.charAt(0).toUpperCase() + account.firstname.slice(1).toLowerCase() + '</div>';

  accountRow                .style.display = 'none';

  document.getElementById('rightsOnServicesHomeMembersBlockListAccounts').insertBefore(accountRow, document.getElementById('rightsOnServicesHomeMembersBlockListAccounts').children[0]);

  displaySuccessToInformationBlock(`${account.firstname.charAt(0).toUpperCase()}${account.firstname.slice(1).toLowerCase()} ${account.lastname.toUpperCase()} ${strings.admin.servicesRights.messages.addedToService}`);

  $(accountRow).fadeIn(250, () =>
  {
    updateMembersPages();
  });
}

/****************************************************************************************************/

socket.on('accountRemovedFromMembers', (accountData, serviceUuid) =>
{
  $.ajax(
  {
    method: 'GET', dataType: 'json', timeout: 2000, url: '/queries/storage/strings', error: (xhr, textStatus, errorThrown) => {  }

  }).done((json) =>
  {
    const strings = json.strings;

    displayErrorToInformationBlock(`${accountData.firstname.charAt(0).toUpperCase()}${accountData.firstname.slice(1).toLowerCase()} ${accountData.lastname.toUpperCase()} ${strings.admin.servicesRights.messages.removedFromService}`);

    var members = document.getElementById('rightsOnServicesHomeMembersBlockListAccounts').children;

    for(var x = 0; x < members.length; x++)
    {
      if(members[x].getAttribute('name') === accountData.uuid)
      {
        members[x].remove();

        updateMembersPages();

        if(document.getElementById('accountRightsPanel') && document.getElementById('accountRightsPanel').getAttribute('name') === accountData.uuid)
        {
          closeAccountRightsPanel(() => {  });
        }

        if(document.getElementById('rightsOnServicesHomeAccountsBlock') && document.getElementById('rightsOnServicesHomeMembersBlock').getAttribute('name') === serviceUuid)
        {
          var accountsBlockListElementsAccount = document.createElement('div');

          accountsBlockListElementsAccount     .setAttribute('id', accountData.uuid);

          accountsBlockListElementsAccount     .setAttribute('class', 'accountsBlockListElementsAccount');
          
          if(document.getElementById('rightsOnServicesHomeAccountsBlockSearch').value.length === 0)
          {
            accountsBlockListElementsAccount.setAttribute('name', 'displayed');

            if(document.getElementById('rightsOnServicesHomeAccountsBlockSelectAll').checked)
            {
              document.getElementById('rightsOnServicesHomeAccountsBlockSelectAll').checked = false;
              document.getElementById('rightsOnServicesHomeAccountsBlockSelectAll').indeterminate = true;
            }
          }

          else if(accountData.email.match(document.getElementById('rightsOnServicesHomeAccountsBlockSearch').value) != null || accountData.lastname.match(document.getElementById('rightsOnServicesHomeAccountsBlockSearch').value) != null || accountData.firstname.match(document.getElementById('rightsOnServicesHomeAccountsBlockSearch').value) != null)
          {
            accountsBlockListElementsAccount.setAttribute('name', 'displayed');

            if(document.getElementById('rightsOnServicesHomeAccountsBlockSelectAll').checked)
            {
              document.getElementById('rightsOnServicesHomeAccountsBlockSelectAll').checked = false;
              document.getElementById('rightsOnServicesHomeAccountsBlockSelectAll').indeterminate = true;
            }
          }

          const tag = Math.floor((document.getElementById('rightsOnServicesHomeAccountsBlockList').children.length + 1) / 10);

          accountsBlockListElementsAccount.setAttribute('tag', tag);

          accountsBlockListElementsAccount.innerHTML += `<div class="accountsBlockListElementsAccountBox"><input onchange="selectAccount(this)" class="accountsBlockListElementsAccountBoxInput" type="checkbox" /></div>`;
          accountsBlockListElementsAccount.innerHTML += `<div class="accountsBlockListElementsAccountEmail">${accountData.email}</div>`;
          accountsBlockListElementsAccount.innerHTML += `<div class="accountsBlockListElementsAccountLastname">${accountData.lastname}</div>`;
          accountsBlockListElementsAccount.innerHTML += `<div class="accountsBlockListElementsAccountFirstname">${accountData.firstname}</div>`;
          accountsBlockListElementsAccount.innerHTML += `<div onclick="addAccountToMembers('${accountData.uuid}')" class="accountsBlockListElementsAccountAdd"><i class="accountsBlockListElementsAccountAddButton fas fa-user-plus"></i></div>`;

          document.getElementById('rightsOnServicesHomeAccountsBlockListElements').appendChild(accountsBlockListElementsAccount);

          updateAccountsBlockPages();
        }
      }
    }
  });
});

/****************************************************************************************************/

socket.on('accountRightsUpdatedOnService', (accountData, accountRights, serviceUuid) =>
{
  $.ajax(
  {
    method: 'GET', dataType: 'json', timeout: 2000, url: '/queries/storage/strings', error: (xhr, textStatus, errorThrown) => {  }

  }).done((json) =>
  {
    const strings = json.strings;

    if(document.getElementById('rightsOnServicesHomeMembersBlock') && document.getElementById('rightsOnServicesHomeMembersBlock').getAttribute('name') === serviceUuid)
    {
      displayMessageToInformationBlock(`${strings.admin.servicesRights.messages.rightsUpdated} ${accountData.firstname.charAt(0).toUpperCase()}${accountData.firstname.slice(1).toLowerCase()} ${accountData.lastname.toUpperCase()}`);

      if(document.getElementById('accountRightsPanel') && document.getElementById('accountRightsPanel').getAttribute('name') === accountData.uuid)
      {
        var rights = document.getElementById('accountRightsPanelList').children;

        for(var x = 0; x < rights.length; x++)
        {
          accountRights[rights[x].getAttribute('name')]
          ? rights[x].children[0].checked = true
          : rights[x].children[0].checked = false;
        }
      }
    }
  });
});

/****************************************************************************************************/