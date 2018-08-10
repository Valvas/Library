/****************************************************************************************************/

function openAccountsBlock()
{
  var spinner                               = document.createElement('div');
  var background                            = document.createElement('div');

  spinner                                   .setAttribute('class', 'storageSpinner');
  background                                .setAttribute('class', 'storageBackground');

  spinner                                   .innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';

  document.body                             .appendChild(background);
  document.body                             .appendChild(spinner);

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
      method: 'PUT',
      dataType: 'json',
      timeout: 5000,
      data: { serviceUuid: document.getElementById('rightsOnServicesHomeMembersBlock').getAttribute('name') },
      url: '/queries/storage/admin/get-accounts-that-can-be-added-to-service',
  
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
      const accounts = json.accounts;

      spinner.remove();
      background.remove();

      var accountsBlock                       = document.createElement('div');
      var accountsBlockBackground             = document.createElement('div');
      var accountsBlockList                   = document.createElement('div');
      var accountsBlockListEmpty              = document.createElement('div');
      var accountsBlockListHeader             = document.createElement('div');
      var accountsBlockListElements           = document.createElement('div');
      var accountsBlockListPages              = document.createElement('div');

      accountsBlock                           .setAttribute('id', 'rightsOnServicesHomeAccountsBlock');
      accountsBlockList                       .setAttribute('id', 'rightsOnServicesHomeAccountsBlockList');
      accountsBlockBackground                 .setAttribute('id', 'rightsOnServicesHomeAccountsBlockBackground');
      accountsBlockListElements               .setAttribute('id', 'rightsOnServicesHomeAccountsBlockListElements');
      accountsBlockListPages                  .setAttribute('id', 'rightsOnServicesHomeAccountsBlockListPages');
      accountsBlockListEmpty                  .setAttribute('id', 'rightsOnServicesHomeAccountsBlockListEmpty');

      accountsBlock                           .setAttribute('class', 'accountsBlock');
      accountsBlockBackground                 .setAttribute('class', 'accountsBlockBackground');
      accountsBlockList                       .setAttribute('class', 'accountsBlockList');
      accountsBlockListHeader                 .setAttribute('class', 'accountsBlockListHeader');
      accountsBlockListPages                  .setAttribute('class', 'accountsBlockListPages');
      accountsBlockListElements               .setAttribute('class', 'accountsBlockListElements');
      accountsBlockListEmpty                  .setAttribute('class', 'accountsBlockListEmpty');

      accountsBlockListEmpty                  .style.display = 'none';

      accountsBlockListEmpty                  .innerText = strings.admin.servicesRights.accountsBlock.empty;

      accountsBlockListHeader                 .innerHTML += `<div class="accountsBlockListHeaderBox"><input onclick="selectAllAccounts(this)" class="accountsBlockListHeaderBoxInput" type="checkbox" id="rightsOnServicesHomeAccountsBlockSelectAll" /></div>`;
      accountsBlockListHeader                 .innerHTML += `<div class="accountsBlockListHeaderEmail">${strings.admin.servicesRights.accountsBlock.header.email}</div>`;
      accountsBlockListHeader                 .innerHTML += `<div class="accountsBlockListHeaderLastname">${strings.admin.servicesRights.accountsBlock.header.lastname}</div>`;
      accountsBlockListHeader                 .innerHTML += `<div class="accountsBlockListHeaderFirstname">${strings.admin.servicesRights.accountsBlock.header.firstname}</div>`;

      accountsBlock                           .innerHTML += `<div class="accountsBlockTitle">${strings.admin.servicesRights.accountsBlock.title}</div>`;
      accountsBlock                           .innerHTML += `<div class="accountsBlockHelp">${strings.admin.servicesRights.accountsBlock.help}</div>`;

      accountsBlockList                       .appendChild(accountsBlockListHeader);

      accountsBlockList                       .appendChild(accountsBlockListEmpty);
      accountsBlockList                       .appendChild(accountsBlockListElements);
      accountsBlockList                       .appendChild(accountsBlockListPages);

      var index = 0;

      var browseAccounts = () =>
      {
        var accountsBlockListElementsAccount = document.createElement('div');

        accountsBlockListElementsAccount     .setAttribute('id', accounts[index].uuid);

        accountsBlockListElementsAccount     .setAttribute('class', 'accountsBlockListElementsAccount');
        
        accountsBlockListElementsAccount     .setAttribute('name', 'displayed');

        accountsBlockListElementsAccount     .setAttribute('tag', Math.floor(index / 10));

        accountsBlockListElementsAccount.innerHTML += `<div class="accountsBlockListElementsAccountBox"><input onchange="selectAccount(this)" class="accountsBlockListElementsAccountBoxInput" type="checkbox" /></div>`;
        accountsBlockListElementsAccount.innerHTML += `<div class="accountsBlockListElementsAccountEmail">${accounts[index].email}</div>`;
        accountsBlockListElementsAccount.innerHTML += `<div class="accountsBlockListElementsAccountLastname">${accounts[index].lastname}</div>`;
        accountsBlockListElementsAccount.innerHTML += `<div class="accountsBlockListElementsAccountFirstname">${accounts[index].firstname}</div>`;
        accountsBlockListElementsAccount.innerHTML += `<div onclick="addAccountToMembers('${accounts[index].uuid}')" class="accountsBlockListElementsAccountAdd"><i class="accountsBlockListElementsAccountAddButton fas fa-user-plus"></i></div>`;

        if(index > 10) accountsBlockListElementsAccount.style.display = 'none';

        accountsBlockListElements            .appendChild(accountsBlockListElementsAccount);

        if(accounts[index += 1] != undefined) browseAccounts();

        else
        {
          for(var x = 0; x < 10; x++)
          {
            var currentPage = `<div tag="${x}" `;
            if(x === 0) currentPage += 'class="accountsBlockListPagesElementSelected" ';

            else if(x < Math.ceil(accounts.length / 10))
            {
              currentPage += 'class="accountsBlockListPagesElementActive" ';
              currentPage += `onclick="changeAccountsBlockPage('${x}')" `;
            }

            else
            {
              currentPage += 'class="accountsBlockListPagesElementInactive" ';
            }

            currentPage += `>${x + 1}</div>`;

            accountsBlockListPages.innerHTML += currentPage;
          }
        }
      }

      accounts.length > 0
      ? browseAccounts()
      : accountsBlockListEmpty.removeAttribute('style');

      accountsBlock                           .innerHTML += `<input oninput="searchAccounts()" id="rightsOnServicesHomeAccountsBlockSearch" class="accountsBlockSearch" title="${strings.admin.servicesRights.membersBlock.hints.accountsBlock.searchBar}" type="text" placeholder="${strings.admin.servicesRights.accountsBlock.searchPlaceholder}" />`;
      accountsBlock                           .innerHTML += `<button onclick="addMultipleAccountsToMembers()" id="rightsOnServicesHomeAccountsBlockAdd" class="accountsBlockAddActive">${strings.admin.servicesRights.accountsBlock.addSelected}</button>`;

      accountsBlock                           .appendChild(accountsBlockList);

      accountsBlock                           .innerHTML += `<button class="accountsBlockClose" onclick="closeAccountsBlock()">${strings.admin.servicesRights.accountsBlock.close}</button>`;

      document.body                           .appendChild(accountsBlockBackground);
      document.body                           .appendChild(accountsBlock);
    });
  });
}

/****************************************************************************************************/