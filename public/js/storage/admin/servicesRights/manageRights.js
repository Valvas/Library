/****************************************************************************************************/

function addRight(uuid, right)
{
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
        data: { accountUUID: uuid, right: right, service: document.getElementById('rightsOnServicesHomeMembersBlock').getAttribute('name') },
        timeout: 10000,
        url: '/queries/storage/admin/add-right-on-service',
    
        error: (xhr, textStatus, errorThrown) =>
        {
          xhr.responseJSON != undefined ?
          openAccountsBlockErrorPopup(background, popup, xhr.responseJSON.message) :
          openAccountsBlockErrorPopup(background, popup, 'Une erreur est survenue, veuillez réessayer plus tard');
        }
    
      }).done((json) =>
      {
        socket.emit('storageAppAdminServicesRightAddedToMember', uuid, right);

        $(popup).toggle('slide', 'left', 250, () =>
        {
          $(background).slideUp(250, () =>
          {
            popup.remove();
            background.remove();
          });
        });
      });
    });
  });
}

/****************************************************************************************************/

function removeRight(uuid, right)
{
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
        data: { accountUUID: uuid, right: right, service: document.getElementById('rightsOnServicesHomeMembersBlock').getAttribute('name') },
        timeout: 10000,
        url: '/queries/storage/admin/remove-right-on-service',
    
        error: (xhr, textStatus, errorThrown) =>
        {
          xhr.responseJSON != undefined ?
          openAccountsBlockErrorPopup(background, popup, xhr.responseJSON.message) :
          openAccountsBlockErrorPopup(background, popup, 'Une erreur est survenue, veuillez réessayer plus tard');
        }
    
      }).done((json) =>
      {
        socket.emit('storageAppAdminServicesRightRemovedToMember', uuid, right);

        $(popup).toggle('slide', 'left', 250, () =>
        {
          $(background).slideUp(250, () =>
          {
            popup.remove();
            background.remove();
          });
        });
      });
    });
  });
}

/****************************************************************************************************/