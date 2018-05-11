/****************************************************************************************************/

function addAccountToMembers(account)
{
  var accounts = { 0: account.uuid };

  var background    = document.createElement('div');
  var popup         = document.createElement('div');
  var spinner       = document.createElement('div');

  background        .setAttribute('class', 'accountsBlockLoadingBackground');
  popup             .setAttribute('class', 'accountsBlockLoadingPopup');
  spinner           .setAttribute('class', 'accountsBlockLoadingSpinner');

  spinner           .innerHTML = '<i class="fas fa-circle-notch fa-spin fa-4x"></i>';

  popup             .appendChild(spinner);

  $(popup)          .hide().appendTo(document.body);
  $(background)     .hide().appendTo(document.body);

  $(background).slideDown(250, () =>
  {
    $(popup).fadeIn(250, () =>
    {
      $.ajax(
      {
        method: 'POST',
        dataType: 'json',
        data: { accounts: JSON.stringify(accounts), serviceName: document.getElementById('rightsOnServicesHomeMembersBlock').getAttribute('name') },
        timeout: 10000,
        url: '/queries/storage/admin/give-access-to-a-service',
    
        error: (xhr, textStatus, errorThrown) =>
        {
          xhr.responseJSON != undefined ?
          openAccountsBlockErrorPopup(background, popup, xhr.responseJSON.message) :
          openAccountsBlockErrorPopup(background, popup, 'Une erreur est survenue, veuillez réessayer plus tard');
        }
    
      }).done((json) =>
      {
        socket.emit('storageAppAdminServicesRightsAccountAddedToMembers', account.uuid);

        setTimeout(() =>
        {
          $(popup).toggle('slide', 'left', 250, () =>
          {
            $(background).slideUp(250, () =>
            {
              popup.remove();
              background.remove();
            });
          });
        }, 1000);
      });
    });
  });
}

/****************************************************************************************************/

function addMultipleAccountsToMembers(event)
{
  var accounts = {};

  var background    = document.createElement('div');
  var popup         = document.createElement('div');
  var spinner       = document.createElement('div');

  background        .setAttribute('class', 'accountsBlockLoadingBackground');
  popup             .setAttribute('class', 'accountsBlockLoadingPopup');
  spinner           .setAttribute('class', 'accountsBlockLoadingSpinner');

  spinner           .innerHTML = '<i class="fas fa-circle-notch fa-spin fa-4x"></i>';

  popup             .appendChild(spinner);

  $(popup)          .hide().appendTo(document.body);
  $(background)     .hide().appendTo(document.body);

  $(background).slideDown(250, () =>
  {
    $(popup).fadeIn(250, () =>
    {
      var accountsToAdd = document.querySelectorAll('input.accountsBlockListElementsAccountBoxInput:checked');

      document.getElementById('rightsOnServicesHomeAccountsBlockSelectAll').checked = false;
      document.getElementById('rightsOnServicesHomeAccountsBlockSelectAll').indeterminate = false;

      document.getElementById('rightsOnServicesHomeAccountsBlockAdd').innerText = document.getElementById('rightsOnServicesHomeAccountsBlockAdd').innerText.split(' ')[0] + ' (0)';

      var x = 0;

      var browseAccountsToAdd = () =>
      {
        var row = accountsToAdd[x].parentNode.parentNode;

        accounts[x] = row.getAttribute('id');

        if(accountsToAdd[x += 1] != undefined) browseAccountsToAdd();

        else
        {
          $.ajax(
          {
            method: 'POST',
            dataType: 'json',
            data: { accounts: JSON.stringify(accounts), serviceName: document.getElementById('rightsOnServicesHomeMembersBlock').getAttribute('name') },
            timeout: 10000,
            url: '/queries/storage/admin/give-access-to-a-service',
        
            error: (xhr, textStatus, errorThrown) =>
            {
              xhr.responseJSON != undefined ?
              openAccountsBlockErrorPopup(background, popup, xhr.responseJSON.message) :
              openAccountsBlockErrorPopup(background, popup, 'Une erreur est survenue, veuillez réessayer plus tard');
            }
        
          }).done((json) =>
          {
            setTimeout(() =>
            {
              $(popup).toggle('slide', 'left', 250, () =>
              {
                $(background).slideUp(250, () =>
                {
                  popup.remove();
                  background.remove();
                });
              });
            }, 1000);

            x = 0;

            var browseAccountsToEmitEvent = () =>
            {
              socket.emit('storageAppAdminServicesRightsAccountAddedToMembers', accounts[x]);

              setTimeout(() => { if(accounts[x += 1] != undefined) browseAccountsToEmitEvent(); }, 250);
            }

            browseAccountsToEmitEvent();
          });
        }
      }

      if(accountsToAdd[x] != undefined) browseAccountsToAdd();
    });
  });
}

/****************************************************************************************************/