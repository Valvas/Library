/****************************************************************************************************/

function removeMemberFromList(event)
{
  var target = event.target;

  var getParentLoop = () =>
  {
    target = target.parentNode;

    if(target.getAttribute('class') != 'membersBlockListAccountsElementRightsRevokeActive') getParentLoop();

    else
    {
      var accounts = { 0: target.parentNode.parentNode.getAttribute('name') };

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
            data: { accounts: JSON.stringify(accounts), serviceUuid: document.getElementById('rightsOnServicesHomeMembersBlock').getAttribute('name') },
            timeout: 10000,
            url: '/queries/storage/admin/remove-access-to-a-service',
        
            error: (xhr, textStatus, errorThrown) =>
            {
              xhr.responseJSON != undefined ?
              openAccountsBlockErrorPopup(background, popup, xhr.responseJSON.message) :
              openAccountsBlockErrorPopup(background, popup, 'Une erreur est survenue, veuillez réessayer plus tard');
            }
        
          }).done((json) =>
          {
            socket.emit('storageAppAdminServicesRightsAccountRemovedFromMembers', target.parentNode.parentNode.getAttribute('name'));
    
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
  }

  if(target.getAttribute('class') != 'membersBlockListAccountsElementRightsRevokeActive') getParentLoop();
}

/****************************************************************************************************/

function openAccountsBlockErrorPopup(background, popup, message)
{
  popup.children[0].remove();
    
  var errorMessage  = document.createElement('div');
  var closeButton   = document.createElement('button');

  closeButton       .setAttribute('class', 'accountsBlockLoadingClose');
  errorMessage      .setAttribute('class', 'accountsBlockLoadingError');

  errorMessage      .innerText = message;

  closeButton       .innerText = 'OK';

  closeButton.addEventListener('click', () =>
  {
    $(popup).toggle('slide', 'left', 250, () =>
    {
      $(background).slideUp(250, () =>
      {
        popup.remove();
        background.remove();
      });
    });
  });

  if($(document.body).width() < 240)
  {
    popup.style.left = '20px';
    popup.style.right = '20px';
    popup.style.width = 'calc(100% - 40px)';
  }

  else
  {
    popup.style.left = 'calc(50% - 100px)';
    popup.style.right = 'calc(50% - 100px)';
    popup.style.width = '200px';
  }

  popup             .appendChild(errorMessage);
  popup             .appendChild(closeButton);
}

/****************************************************************************************************/