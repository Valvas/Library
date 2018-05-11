/****************************************************************************************************/

var socket = io();

/****************************************************************************************************/

socket.on('connect', () =>
{
  socket.emit('storageAppAdminServicesRightsJoin');
});

/****************************************************************************************************/

socket.on('accountAddedToMembers', (accountUUID) =>
{
  $.ajax(
  {
    method: 'GET',
    dataType: 'json',
    timeout: 2000,
    url: '/queries/storage/admin/get-account-admin-rights',

    error: (xhr, textStatus, errorThrown) => {  }

  }).done((json) =>
  {
    var rights = json.rights;

    $.ajax(
    {
      method: 'GET',
      dataType: 'json',
      timeout: 2000,
      url: '/queries/storage/strings',
  
      error: (xhr, textStatus, errorThrown) => {  }
  
    }).done((json) =>
    {
      var strings = json.strings;

      $.ajax(
      {
        method: 'POST',
        dataType: 'json',
        data: { accountUUID: accountUUID },
        timeout: 2000,
        url: '/queries/accounts/get-account-from-uuid',
    
        error: (xhr, textStatus, errorThrown) => {  }
    
      }).done((json) =>
      {
        var account = json.account;

        var accounts = document.getElementById('rightsOnServicesHomeAccountsBlockListElements').children;

        var x = 0;

        var browseAccounts = () =>
        {
          if(accounts[x].getAttribute('id') == account.uuid)
          {
            accounts[x].remove();

            var pageSelectors = document.getElementById('rightsOnServicesHomeAccountsBlockListPages').children;

            var y = 0;

            var browsePages = () =>
            {
              if(pageSelectors[y].getAttribute('class') == 'accountsBlockListPagesElementSelected')
              {
                updateAccountsBlockPages(pageSelectors[y].getAttribute('tag'));

                checkIfAccountAlreadyExists(account.uuid, (error, alreadyExists) =>
                {
                  if(error == null)
                  {
                    if(alreadyExists == false) addAccountToMembersBlock(rights, account, strings);
                  }
                });
              }

              else
              {
                if(pageSelectors[y += 1] != undefined) browsePages();

                else
                {
                  updateAccountsBlockPages(null);

                  checkIfAccountAlreadyExists(account.uuid, (error, alreadyExists) =>
                  {
                    if(error == null)
                    {
                      if(alreadyExists == false) addAccountToMembersBlock(rights, account, strings);
                    }
                  });
                }
              }
            }

            if(pageSelectors[y] != undefined) browsePages();
          }

          else if(accounts[x += 1] != undefined) browseAccounts();
        }

        if(accounts[x] != undefined) browseAccounts();
      });
    });
  });
});

/****************************************************************************************************/

function checkIfAccountAlreadyExists(accountUUID, callback)
{
  var x = 0;
  var accounts = document.getElementById('rightsOnServicesHomeMembersBlockListAccounts').children;

  var browseAccounts = () =>
  {
    if(accounts[x].getAttribute('name') == accountUUID) return callback(null, true);

    if(accounts[x += 1] == undefined) return callback(null, false);

    browseAccounts();
  }

  accounts[x] != undefined ? browseAccounts() : callback(null, false);
}

/****************************************************************************************************/

function addAccountToMembersBlock(rights, account, strings)
{
  if(document.getElementById('rightsOnServicesHomeMembersBlockEmpty')) document.getElementById('rightsOnServicesHomeMembersBlockEmpty').style.display = 'none';

  var amountOfAccounts = document.getElementById('rightsOnServicesHomeMembersBlockListAccounts').children.length;

  var accountRow            = document.createElement('div');
  var accountRowLabels      = document.createElement('div');
  var accountRowRights      = document.createElement('div');

  accountRow                .setAttribute('tag', Math.floor(amountOfAccounts / 10));
  accountRow                .setAttribute('class', 'membersBlockListAccountsElement');
  accountRow                .setAttribute('name', account.uuid);

  accountRowLabels          .setAttribute('class', 'membersBlockListAccountsElementLabels');
  accountRowRights          .setAttribute('class', 'membersBlockListAccountsElementRights');

  accountRowLabels          .innerHTML = '<div class="membersBlockListAccountsElementLabelsEmail">' + account.email + '</div><div class="membersBlockListAccountsElementLabelsLastname">' + account.lastname.toUpperCase() + '</div><div class="membersBlockListAccountsElementLabelsFirstname">' + account.firstname.charAt(0).toUpperCase() + account.firstname.slice(1).toLowerCase() + '</div>';
  accountRowRights          .innerHTML = '';

  if(rights.add_services_rights == 0)
  {
    accountRowRights.innerHTML += '<div class="membersBlockListAccountsElementRightsSwitch" title="' + strings.admin.servicesRights.membersBlock.hints.update.addRight.false + '"><div class="membersBlockListAccountsElementRightsSwitchBackgroundInactive"><div class="membersBlockListAccountsElementRightsSwitchCircleInactive"></div></div></div>';
    accountRowRights.innerHTML += '<div class="membersBlockListAccountsElementRightsSwitch" title="' + strings.admin.servicesRights.membersBlock.hints.update.addRight.false + '"><div class="membersBlockListAccountsElementRightsSwitchBackgroundInactive"><div class="membersBlockListAccountsElementRightsSwitchCircleInactive"></div></div></div>';
    accountRowRights.innerHTML += '<div class="membersBlockListAccountsElementRightsSwitch" title="' + strings.admin.servicesRights.membersBlock.hints.update.addRight.false + '"><div class="membersBlockListAccountsElementRightsSwitchBackgroundInactive"><div class="membersBlockListAccountsElementRightsSwitchCircleInactive"></div></div></div>';
    accountRowRights.innerHTML += '<div class="membersBlockListAccountsElementRightsSwitch" title="' + strings.admin.servicesRights.membersBlock.hints.update.addRight.false + '"><div class="membersBlockListAccountsElementRightsSwitchBackgroundInactive"><div class="membersBlockListAccountsElementRightsSwitchCircleInactive"></div></div></div>';
  }

  else
  {
    accountRowRights.innerHTML += '<div class="membersBlockListAccountsElementRightsSwitch" title="' + strings.admin.servicesRights.membersBlock.hints.update.addRight.true + '"><div class="membersBlockListAccountsElementRightsSwitchBackgroundDisabled"><div class="membersBlockListAccountsElementRightsSwitchCircleDisabled"></div></div></div>';
    accountRowRights.innerHTML += '<div class="membersBlockListAccountsElementRightsSwitch" title="' + strings.admin.servicesRights.membersBlock.hints.update.addRight.true + '"><div class="membersBlockListAccountsElementRightsSwitchBackgroundDisabled"><div class="membersBlockListAccountsElementRightsSwitchCircleDisabled"></div></div></div>';
    accountRowRights.innerHTML += '<div class="membersBlockListAccountsElementRightsSwitch" title="' + strings.admin.servicesRights.membersBlock.hints.update.addRight.true + '"><div class="membersBlockListAccountsElementRightsSwitchBackgroundDisabled"><div class="membersBlockListAccountsElementRightsSwitchCircleDisabled"></div></div></div>';
    accountRowRights.innerHTML += '<div class="membersBlockListAccountsElementRightsSwitch" title="' + strings.admin.servicesRights.membersBlock.hints.update.addRight.true + '"><div class="membersBlockListAccountsElementRightsSwitchBackgroundDisabled"><div class="membersBlockListAccountsElementRightsSwitchCircleDisabled"></div></div></div>';
    accountRowRights.innerHTML += '<button class="membersBlockListAccountsElementRightsButton" title="' + strings.admin.servicesRights.membersBlock.hints.modifyRights + '"><i class="fas fa-pencil-alt"></i></button>';
  }

  var removeButton          = document.createElement('div');

  if(rights.remove_services_rights == 0)
  {
    removeButton.setAttribute('class', 'membersBlockListAccountsElementRightsRevokeInactive');
    removeButton.setAttribute('title', strings.admin.servicesRights.membersBlock.hints.revokeAccess.false);
  }

  else
  {
    removeButton.setAttribute('class', 'membersBlockListAccountsElementRightsRevokeActive');
    removeButton.setAttribute('title', strings.admin.servicesRights.membersBlock.hints.revokeAccess.true);
    removeButton.addEventListener('click', removeMemberFromList);
    removeButton.innerHTML = '<i class="fas fa-user-times"></i>';
  }

  accountRowRights          .appendChild(removeButton);

  accountRow                .appendChild(accountRowLabels);
  accountRow                .appendChild(accountRowRights);

  accountRow                .style.display = 'none';

  document.getElementById('rightsOnServicesHomeMembersBlockListAccounts').insertBefore(accountRow, document.getElementById('rightsOnServicesHomeMembersBlockListAccounts').children[0]);

  $(accountRow).fadeIn(250, () =>
  {
    updateMembersPages();
  });
}

/****************************************************************************************************/

socket.on('accountRemovedFromMembers', (accountUUID) =>
{
  $.ajax(
  {
    method: 'GET',
    dataType: 'json',
    timeout: 2000,
    url: '/queries/storage/admin/get-account-admin-rights',

    error: (xhr, textStatus, errorThrown) => {  }

  }).done((json) =>
  {
    var rights = json.rights;

    $.ajax(
    {
      method: 'GET',
      dataType: 'json',
      timeout: 2000,
      url: '/queries/storage/strings',
  
      error: (xhr, textStatus, errorThrown) => {  }
  
    }).done((json) =>
    {
      var strings = json.strings;

      $.ajax(
      {
        method: 'POST',
        dataType: 'json',
        data: { accountUUID: accountUUID },
        timeout: 2000,
        url: '/queries/accounts/get-account-from-uuid',
    
        error: (xhr, textStatus, errorThrown) => {  }
    
      }).done((json) =>
      {
        var account = json.account;

        var members = document.getElementById('rightsOnServicesHomeMembersBlockListAccounts').children;

        var x = 0;

        var browseMembersToRemoveSelectedOne = () =>
        {
          if(members[x].getAttribute('name') == account.uuid)
          {
            $(members[x]).fadeOut(250, () =>
            {
              members[x].remove();

              updateMembersPages();

              var accountToAdd = document.createElement('div');

              accountToAdd.setAttribute('id', account.uuid);
              accountToAdd.setAttribute('class', 'accountsBlockListElementsAccount');

              accountToAdd.innerHTML  = '<div class="accountsBlockListElementsAccountBox"><input class="accountsBlockListElementsAccountBoxInput" type="checkbox"></div>';
              accountToAdd.innerHTML += '<div class="accountsBlockListElementsAccountEmail">' + account.email + '</div>';
              accountToAdd.innerHTML += '<div class="accountsBlockListElementsAccountLastname">' + account.lastname.toUpperCase() + '</div>';
              accountToAdd.innerHTML += '<div class="accountsBlockListElementsAccountFirstname">' + account.firstname.charAt(0).toUpperCase() + account.firstname.slice(1).toLowerCase() + '</div>';

              if(rights.add_services_rights == 0)
              {
                accountToAdd.innerHTML += '<div class="accountsBlockListElementsAccountAdd"></div>';
              }

              else
              {
                var addButton     = document.createElement('div');

                addButton         .setAttribute('class', 'accountsBlockListElementsAccountAdd');
                addButton         .innerHTML = '<i class="accountsBlockListElementsAccountAddButton fas fa-user-plus"></i>';
                addButton         .addEventListener('click', () => { addAccountToMembers(account); });
                
                accountToAdd      .appendChild(addButton);
              }

              document.getElementById('rightsOnServicesHomeAccountsBlockListElements').insertBefore(accountToAdd, document.getElementById('rightsOnServicesHomeAccountsBlockListElements').children[0]);

              searchAccounts();
            });
          }

          else if(members[x += 1] != undefined) browseMembersToRemoveSelectedOne();
        }

        if(members[x] != undefined) browseMembersToRemoveSelectedOne();
      });
    });
  });
});

/****************************************************************************************************/