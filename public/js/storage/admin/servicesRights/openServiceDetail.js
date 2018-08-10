/****************************************************************************************************/

var xhr = new XMLHttpRequest();
var intervalFunction = null;

/****************************************************************************************************/

function showServicesBlocks()
{
  if(!(document.getElementById('rightsOnServicesHomeServicesMembers')))
  {
    document.getElementById('rightsOnServicesHomeServicesBlock').removeAttribute('style');

    var services = document.getElementById('rightsOnServicesHomeServicesBlock').children;

    for(var x = 0; x < services.length; x++)
    {
      services[x].removeAttribute('style');
    }
  }
}

/****************************************************************************************************/

function hideServicesBlocks(serviceUuid)
{
  if(!(document.getElementById('rightsOnServicesHomeServicesMembers')))
  {
    var services = document.getElementById('rightsOnServicesHomeServicesBlock').children;

    for(var x = 0; x < services.length; x++)
    {
      services[x].style.display = 'none';
    }

    createServiceDetail(serviceUuid);
  }
}

/****************************************************************************************************/

function createServiceDetail(serviceUuid)
{
  var spinner            = document.createElement('div');
  var background         = document.createElement('div');

  spinner                .setAttribute('class', 'storageSpinner');
  background             .setAttribute('class', 'storageBackground');

  spinner                .innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';

  document.body          .appendChild(background);
  document.body          .appendChild(spinner);

  $.ajax(
  {
    method: 'GET',
    dataType: 'json',
    timeout: 5000,
    url: '/queries/storage/strings',

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
      method: 'GET',
      dataType: 'json',
      timeout: 5000,
      url: '/queries/storage/admin/get-account-admin-rights',
  
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

      $.ajax(
      {
        type: 'PUT', timeout: 5000, dataType: 'JSON', data: { serviceUuid: serviceUuid }, url: '/queries/storage/admin/get-service-members', success: () => {},

        error: (xhr, status, error) =>
        {
          spinner.remove();
          background.remove();
    
          xhr.responseJSON != undefined ?
          displayErrorMessage(xhr.responseJSON.message, xhr.responseJSON.detail) :
          displayErrorMessage('Une erreur est survenue, veuillez réessayer plus tard', null);
        }
      }).done((json) =>
      {
        createMembersBlock(json.serviceMembers, rights, strings, serviceUuid, () =>
        {
          createPagesList(json.serviceMembers.length, () =>
          {
            spinner.remove();
            background.remove();
          });
        });
      });
    });
  });
}

/****************************************************************************************************/

function createMembersBlock(members, rights, strings, serviceUuid, callback)
{
  var membersBlock                      = document.createElement('div');
  var membersBlockEmpty                 = document.createElement('div');
  var membersBlockHeader                = document.createElement('div');
  var membersBlockList                  = document.createElement('div');
  var membersBlockListLabels            = document.createElement('div');
  var membersBlockListLabelsEmail       = document.createElement('div');
  var membersBlockListLabelsLastname    = document.createElement('div');
  var membersBlockListLabelsFirstname   = document.createElement('div');
  var membersBlockListAccounts          = document.createElement('div');

  membersBlock                          .innerHTML += `<div class="membersBlockTitle">${strings.admin.servicesRights.membersBlock.title}</div>`;

  rights.update_services_rights === 1
  ? membersBlockHeader                  .innerHTML += `<button onclick="openAccountsBlock()" class="membersBlockHeaderAddEnabled" title="${strings.admin.servicesRights.membersBlock.hints.addMember.true}">${strings.admin.servicesRights.membersBlock.header.add}</button>`
  : membersBlockHeader                  .innerHTML += `<button class="membersBlockHeaderAddDisabled" title="${strings.admin.servicesRights.membersBlock.hints.addMember.false}">${strings.admin.servicesRights.membersBlock.header.add}</button>`;
  membersBlockHeader                    .innerHTML += `<button onclick="closeMembersBlock()" class="membersBlockHeaderClose">${strings.admin.servicesRights.membersBlock.header.close}</button>`;

  membersBlock                          .setAttribute('id', 'rightsOnServicesHomeMembersBlock');
  membersBlockEmpty                     .setAttribute('id', 'rightsOnServicesHomeMembersBlockEmpty');
  membersBlockList                      .setAttribute('id', 'rightsOnServicesHomeMembersBlockList');
  membersBlockListAccounts              .setAttribute('id', 'rightsOnServicesHomeMembersBlockListAccounts');

  membersBlock                          .setAttribute('name', serviceUuid);

  membersBlock                          .setAttribute('class', 'membersBlock');
  membersBlockEmpty                     .setAttribute('class', 'membersBlockEmpty');
  membersBlockHeader                    .setAttribute('class', 'membersBlockHeader');
  membersBlockList                      .setAttribute('class', 'membersBlockList');
  membersBlockListLabels                .setAttribute('class', 'membersBlockListLabels');
  membersBlockListLabelsEmail           .setAttribute('class', 'membersBlockListLabelsEmail');
  membersBlockListLabelsLastname        .setAttribute('class', 'membersBlockListLabelsLastname');
  membersBlockListLabelsFirstname       .setAttribute('class', 'membersBlockListLabelsFirstname');
  membersBlockListAccounts              .setAttribute('class', 'membersBlockListAccounts');

  membersBlockEmpty                     .innerText = strings.admin.servicesRights.membersBlock.empty;
  membersBlockListLabelsEmail           .innerText = strings.admin.servicesRights.membersBlock.header.email;
  membersBlockListLabelsLastname        .innerText = strings.admin.servicesRights.membersBlock.header.lastname;
  membersBlockListLabelsFirstname       .innerText = strings.admin.servicesRights.membersBlock.header.firstname;

  membersBlockListLabels                .appendChild(membersBlockListLabelsEmail);
  membersBlockListLabels                .appendChild(membersBlockListLabelsLastname);
  membersBlockListLabels                .appendChild(membersBlockListLabelsFirstname);

  membersBlockList                      .appendChild(membersBlockListLabels);
  membersBlockList                      .appendChild(membersBlockListAccounts);

  membersBlock                          .appendChild(membersBlockHeader);
  membersBlock                          .appendChild(membersBlockList);

  $(membersBlockEmpty)                  .hide().appendTo(membersBlockList);

  for(var x = 0; x < members.length; x++)
  {
    var memberAccount = document.createElement('div');

    const accountUuid = members[x].accountUuid;

    memberAccount.setAttribute('tag', Math.floor(x / 10));
    memberAccount.setAttribute('class', 'membersBlockListAccountsElement');
    memberAccount.setAttribute('name', members[x].accountUuid);

    memberAccount.addEventListener('click', () => { openAccountRightsPanel(accountUuid) });

    memberAccount.innerHTML += `<div class="membersBlockListAccountsElementLabelsEmail">${members[x].accountEmail}</div>`;
    memberAccount.innerHTML += `<div class="membersBlockListAccountsElementLabelsLastname">${members[x].accountLastname.toUpperCase()}</div>`;
    memberAccount.innerHTML += `<div class="membersBlockListAccountsElementLabelsFirstname">${members[x].accountFirstname.charAt(0).toUpperCase()}${members[x].accountFirstname.slice(1).toLowerCase()}</div>`;

    if(x >= 10) memberAccount.style.display = 'none';

    membersBlockListAccounts.appendChild(memberAccount);
  }

  document.getElementById('mainBlock').appendChild(membersBlock);

  return callback();
}

/****************************************************************************************************/

function closeMembersBlock()
{
  if(document.getElementById('rightsOnServicesHomeMembersBlock')) document.getElementById('rightsOnServicesHomeMembersBlock').remove();
  if(document.getElementById('accountRightsPanel')) document.getElementById('accountRightsPanel').remove();

  showServicesBlocks();
}

/****************************************************************************************************/

function createPagesList(amountOfMembers, callback)
{
  var endPage = 9, x = 0;

  var pagesBlock            = document.createElement('div');

  pagesBlock                .setAttribute('id', 'rightsOnServicesHomeMembersBlockPages');
  pagesBlock                .setAttribute('class', 'membersBlockListPages');

  var loop = () =>
  {
    var pagesBlockNumber    = document.createElement('div');

    pagesBlockNumber        .innerText = x + 1;

    pagesBlockNumber        .setAttribute('tag', x);

    if(x == 0 && amountOfMembers > 0)
    {
      pagesBlockNumber      .setAttribute('class', 'membersBlockListPagesElementSelected');
    }

    else if(amountOfMembers > (x * 10))
    {
      pagesBlockNumber      .setAttribute('class', 'membersBlockListPagesElementActive');
      pagesBlockNumber      .setAttribute('onclick', 'changeMembersPage(' + x + ')');
    }

    else
    {
      pagesBlockNumber      .setAttribute('class', 'membersBlockListPagesElementInactive');
    }

    pagesBlock              .appendChild(pagesBlockNumber);

    if((x += 1) <= endPage) loop();

    else
    {
      if(document.getElementById('rightsOnServicesHomeMembersBlockList')) document.getElementById('rightsOnServicesHomeMembersBlockList').appendChild(pagesBlock);
      callback();
    }
  }

  loop();
}

/****************************************************************************************************/

function createAccountListBlock(accounts, members, strings, callback)
{
  var accountsBlock                         = document.createElement('div');
  var accountsBlockBackground               = document.createElement('div');
  var accountsBlockTitle                    = document.createElement('div');
  var accountsBlockHelp                     = document.createElement('div');
  var accountsBlockList                     = document.createElement('div');
  var accountsBlockListHeader               = document.createElement('div');
  var accountsBlockListHeaderBox            = document.createElement('div');
  var accountsBlockListHeaderEmail          = document.createElement('div');
  var accountsBlockListHeaderLastname       = document.createElement('div');
  var accountsBlockListHeaderFirstname      = document.createElement('div');
  var accountsBlockListElements             = document.createElement('div');
  var accountsBlockListPages                = document.createElement('div');
  var accountsBlockListEmpty                = document.createElement('div');
  var accountsBlockListHeaderBoxInput       = document.createElement('input');
  var accountsBlockSearch                   = document.createElement('input');
  var accountsBlockAdd                      = document.createElement('button');
  var accountsBlockClose                    = document.createElement('button');

  accountsBlock                             .setAttribute('id', 'rightsOnServicesHomeAccountsBlock');
  accountsBlockBackground                   .setAttribute('id', 'rightsOnServicesHomeAccountsBlockBackground');
  accountsBlockAdd                          .setAttribute('id', 'rightsOnServicesHomeAccountsBlockAdd');
  accountsBlockListElements                 .setAttribute('id', 'rightsOnServicesHomeAccountsBlockListElements');
  accountsBlockListPages                    .setAttribute('id', 'rightsOnServicesHomeAccountsBlockListPages');
  accountsBlockListEmpty                    .setAttribute('id', 'rightsOnServicesHomeAccountsBlockListEmpty');
  accountsBlockSearch                       .setAttribute('id', 'rightsOnServicesHomeAccountsBlockSearch');
  accountsBlockListHeaderBoxInput           .setAttribute('id', 'rightsOnServicesHomeAccountsBlockSelectAll');

  accountsBlock                             .setAttribute('class', 'accountsBlock');
  accountsBlockBackground                   .setAttribute('class', 'accountsBlockBackground');
  accountsBlockTitle                        .setAttribute('class', 'accountsBlockTitle');
  accountsBlockHelp                         .setAttribute('class', 'accountsBlockHelp');
  accountsBlockSearch                       .setAttribute('class', 'accountsBlockSearch');
  accountsBlockAdd                          .setAttribute('class', 'accountsBlockAddActive');
  accountsBlockClose                        .setAttribute('class', 'accountsBlockClose');
  accountsBlockList                         .setAttribute('class', 'accountsBlockList');
  accountsBlockListHeader                   .setAttribute('class', 'accountsBlockListHeader');
  accountsBlockListHeaderBox                .setAttribute('class', 'accountsBlockListHeaderBox');
  accountsBlockListHeaderBoxInput           .setAttribute('class', 'accountsBlockListHeaderBoxInput');
  accountsBlockListHeaderEmail              .setAttribute('class', 'accountsBlockListHeaderEmail');
  accountsBlockListHeaderLastname           .setAttribute('class', 'accountsBlockListHeaderLastname');
  accountsBlockListHeaderFirstname          .setAttribute('class', 'accountsBlockListHeaderFirstname');
  accountsBlockListPages                    .setAttribute('class', 'accountsBlockListPages');
  accountsBlockListElements                 .setAttribute('class', 'accountsBlockListElements');
  accountsBlockListEmpty                    .setAttribute('class', 'accountsBlockListEmpty');

  accountsBlockListEmpty                    .style.display = 'none';

  accountsBlockSearch                       .setAttribute('title', strings.admin.servicesRights.membersBlock.hints.accountsBlock.searchBar);

  accountsBlockSearch                       .setAttribute('placeholder', strings.admin.servicesRights.accountsBlock.searchPlaceholder);

  accountsBlockClose                        .setAttribute('onclick', 'closeAccountsBlock()');

  accountsBlockListHeaderBoxInput           .setAttribute('type', 'checkbox');

  accountsBlockListHeaderBoxInput           .addEventListener('click', selectAllAccounts);
  accountsBlockSearch                       .addEventListener('input', searchAccounts);
  accountsBlockAdd                          .addEventListener('click', addMultipleAccountsToMembers);

  accountsBlockTitle                        .innerText = strings.admin.servicesRights.accountsBlock.title;
  accountsBlockHelp                         .innerText = strings.admin.servicesRights.accountsBlock.help;
  accountsBlockAdd                          .innerText = strings.admin.servicesRights.accountsBlock.addSelected;
  accountsBlockClose                        .innerText = strings.admin.servicesRights.accountsBlock.close;
  accountsBlockListEmpty                    .innerText = strings.admin.servicesRights.accountsBlock.empty;

  accountsBlockListHeaderEmail              .innerText = strings.admin.servicesRights.accountsBlock.header.email;
  accountsBlockListHeaderLastname           .innerText = strings.admin.servicesRights.accountsBlock.header.lastname;
  accountsBlockListHeaderFirstname          .innerText = strings.admin.servicesRights.accountsBlock.header.firstname;

  accountsBlockListHeaderBox                .appendChild(accountsBlockListHeaderBoxInput);

  accountsBlockListHeader                   .appendChild(accountsBlockListHeaderBox);
  accountsBlockListHeader                   .appendChild(accountsBlockListHeaderEmail);
  accountsBlockListHeader                   .appendChild(accountsBlockListHeaderLastname);
  accountsBlockListHeader                   .appendChild(accountsBlockListHeaderFirstname);

  var x = 0, counter = 0;

  var browseAccounts = () =>
  {
    if(members[Object.keys(accounts)[x]] == undefined)
    {
      counter += 1;

      var account = accounts[Object.keys(accounts)[x]];

      var accountsBlockListElementsAccount              = document.createElement('div');
      var accountsBlockListElementsAccountBox           = document.createElement('div');
      var accountsBlockListElementsAccountEmail         = document.createElement('div');
      var accountsBlockListElementsAccountLastname      = document.createElement('div');
      var accountsBlockListElementsAccountFirstname     = document.createElement('div');
      var accountsBlockListElementsAccountAdd           = document.createElement('div');

      accountsBlockListElementsAccount                  .setAttribute('name', 'displayed');
      accountsBlockListElementsAccount                  .setAttribute('tag', Math.floor(x / 10));

      accountsBlockListElementsAccount                  .setAttribute('id', account.uuid);

      accountsBlockListElementsAccount                  .setAttribute('class', 'accountsBlockListElementsAccount');
      accountsBlockListElementsAccountBox               .setAttribute('class', 'accountsBlockListElementsAccountBox');
      accountsBlockListElementsAccountEmail             .setAttribute('class', 'accountsBlockListElementsAccountEmail');
      accountsBlockListElementsAccountLastname          .setAttribute('class', 'accountsBlockListElementsAccountLastname');
      accountsBlockListElementsAccountFirstname         .setAttribute('class', 'accountsBlockListElementsAccountFirstname');
      accountsBlockListElementsAccountAdd               .setAttribute('class', 'accountsBlockListElementsAccountAdd');

      accountsBlockListElementsAccountBox               .innerHTML = '<input class="accountsBlockListElementsAccountBoxInput" type="checkbox" />';
      accountsBlockListElementsAccountEmail             .innerText = accounts[Object.keys(accounts)[x]].email;
      accountsBlockListElementsAccountLastname          .innerText = accounts[Object.keys(accounts)[x]].lastname.toUpperCase();
      accountsBlockListElementsAccountFirstname         .innerText = accounts[Object.keys(accounts)[x]].firstname.charAt(0).toUpperCase() + accounts[Object.keys(accounts)[x]].firstname.slice(1).toLowerCase();
      accountsBlockListElementsAccountAdd               .innerHTML = '<i class="accountsBlockListElementsAccountAddButton fas fa-user-plus"></i>';

      accountsBlockListElementsAccountBox.children[0]   .addEventListener('change', selectAccount);
      accountsBlockListElementsAccountAdd               .addEventListener('click', () => { addAccountToMembers(account); });

      if(counter > 10) accountsBlockListElementsAccount.style.display = 'none';

      accountsBlockListElementsAccount                  .appendChild(accountsBlockListElementsAccountBox);
      accountsBlockListElementsAccount                  .appendChild(accountsBlockListElementsAccountEmail);
      accountsBlockListElementsAccount                  .appendChild(accountsBlockListElementsAccountLastname);
      accountsBlockListElementsAccount                  .appendChild(accountsBlockListElementsAccountFirstname);
      accountsBlockListElementsAccount                  .appendChild(accountsBlockListElementsAccountAdd);

      accountsBlockListElements                         .appendChild(accountsBlockListElementsAccount);
    }

    if(accounts[Object.keys(accounts)[x += 1]] != undefined) browseAccounts();

    else
    {
      if(counter == 0)
      {
        accountsBlockListEmpty.removeAttribute('style');
      }

      var y = 0;

      var displayPages = () =>
      {
        var accountsBlockListPagesElement           = document.createElement('div');

        accountsBlockListPagesElement               .setAttribute('tag', y);

        if(y == 0 && counter > 0) accountsBlockListPagesElement.setAttribute('class', 'accountsBlockListPagesElementSelected');
        
        else if(counter == 0 || y > Math.floor(counter / 10)) accountsBlockListPagesElement.setAttribute('class', 'accountsBlockListPagesElementInactive');
        
        else
        { 
          accountsBlockListPagesElement.setAttribute('class', 'accountsBlockListPagesElementActive');
          accountsBlockListPagesElement.setAttribute('onclick', 'changeAccountsBlockPage(' + y + ')');
        }

        accountsBlockListPagesElement               .innerText = y + 1;

        accountsBlockListPages                      .appendChild(accountsBlockListPagesElement);

        if((y += 1) < 10) displayPages();

        else
        {
          accountsBlockList                         .appendChild(accountsBlockListHeader);
          accountsBlockList                         .appendChild(accountsBlockListEmpty);
          accountsBlockList                         .appendChild(accountsBlockListElements);
          accountsBlockList                         .appendChild(accountsBlockListPages);

          accountsBlock                             .appendChild(accountsBlockTitle);
          accountsBlock                             .appendChild(accountsBlockHelp);
          accountsBlock                             .appendChild(accountsBlockSearch);
          accountsBlock                             .appendChild(accountsBlockAdd);
          accountsBlock                             .appendChild(accountsBlockList);
          accountsBlock                             .appendChild(accountsBlockClose);

          $(accountsBlock)                          .hide().appendTo(document.body);
          $(accountsBlockBackground)                .hide().appendTo(document.body);

          callback();
        }
      }

      displayPages();
    }
  }

  browseAccounts();
}

/****************************************************************************************************/