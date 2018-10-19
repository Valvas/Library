/****************************************************************************************************/

var strings = null;

/****************************************************************************************************/

if(document.getElementById('accountLevelSelect'))
{
  document.getElementById('accountLevelSelect').addEventListener('change', updateRightsList);

  const lists = document.getElementsByName('accountDataBlockRightsList');

  for(var x = 0; x < lists.length; x++)
  {
    if(lists[x].getAttribute('tag') === document.getElementById('accountLevelSelect').value)
    {
      lists[x].style.display = 'block';
    }
  }
}

/****************************************************************************************************/

function updateRightsList(event)
{
  const lists = document.getElementsByName('accountDataBlockRightsList');

  for(var x = 0; x < lists.length; x++)
  {
    lists[x].getAttribute('tag') === event.target.value
    ? lists[x].style.display = 'block'
    : lists[x].removeAttribute('style');
  }
}

/****************************************************************************************************/

if(document.getElementById('accountLevelSelectionSave')) document.getElementById('accountLevelSelectionSave').addEventListener('click', openConfirmationPopup);

/****************************************************************************************************/

function openConfirmationPopup(event)
{
  if(document.getElementById('accountLevelConfirmationPopup') == null)
  {
    var selectedLevel = '?';

    if(document.getElementById('accountLevelSelect')) selectedLevel = document.getElementById('accountLevelSelect').value;

    var background  = document.createElement('div');

    background      .setAttribute('class', 'accountAdminLevelConfirmationBackground');
    background      .setAttribute('id', 'accountAdminLevelConfirmationBackground');
    document.body   .appendChild(background);

    displayLoader('', (loader) =>
    {
      $.ajax(
      {
        type: 'GET', timeout: 5000, dataType: 'JSON', url: '/queries/strings/get-storage', success: () => {},
        error: (xhr, status, error) =>
        {
          background.remove();

          removeLoader(loader, () =>
          {
            xhr.responseJSON != undefined ?
            displayError(xhr.responseJSON.message, xhr.responseJSON.detail, null) :
            displayError('Une erreur est survenue, veuillez réessayer plus tard', null, null);
          });
        }
                            
      }).done((result) =>
      {
        strings = result.strings;

        removeLoader(loader, () =>
        {
          var popup       = document.createElement('div');

          popup.innerHTML += `<div class="accountAdminLevelConfirmationPopupTitle">${strings.admin.accountsLevel.detail.confirmationPopup.title}</div>`;
          popup.innerHTML += `<div class="accountAdminLevelConfirmationPopupMessage">${strings.admin.accountsLevel.detail.confirmationPopup.message}</div>`;
          popup.innerHTML += `<div class="accountAdminLevelConfirmationPopupMessage">${strings.admin.accountsLevel.detail.confirmationPopup.level} : ${selectedLevel}</div>`;
          popup.innerHTML += `<div class="accountAdminLevelConfirmationPopupButtons"><div class="accountAdminLevelConfirmationPopupConfirm" onclick="sendNewLevelToServer()">${strings.admin.accountsLevel.detail.confirmationPopup.confirm}</div><div class="accountAdminLevelConfirmationPopupCancel" onclick="closeConfirmationPopup()">${strings.admin.accountsLevel.detail.confirmationPopup.cancel}</div></div>`;

          popup           .setAttribute('class', 'accountAdminLevelConfirmationPopup');
          popup           .setAttribute('id', 'accountAdminLevelConfirmationPopup');
          document.body   .appendChild(popup);
        });
      });
    });
  }
}

/****************************************************************************************************/

function closeConfirmationPopup()
{
  if(document.getElementById('accountAdminLevelConfirmationBackground')) document.getElementById('accountAdminLevelConfirmationBackground').remove();
  if(document.getElementById('accountAdminLevelConfirmationPopup')) document.getElementById('accountAdminLevelConfirmationPopup').remove();
}

/****************************************************************************************************/

function sendNewLevelToServer()
{
  if(document.getElementById('accountAdminLevelConfirmationPopup')) document.getElementById('accountAdminLevelConfirmationPopup').remove();

  displayLoader(strings.admin.accountsLevel.detail.confirmationPopup.sendingMessage, (loader) =>
  {
    $.ajax(
    {
      type: 'PUT', timeout: 5000, data: { accountUuid: document.getElementById('accountDataBlock').getAttribute('name'), adminLevel: parseInt(document.getElementById('accountLevelSelect').value) }, dataType: 'JSON', url: '/queries/storage/admin/update-account-admin-level', success: () => {},
      error: (xhr, status, error) =>
      {
        if(document.getElementById('accountAdminLevelConfirmationBackground')) document.getElementById('accountAdminLevelConfirmationBackground').remove();

        removeLoader(loader, () =>
        {
          xhr.responseJSON != undefined ?
          displayError(xhr.responseJSON.message, xhr.responseJSON.detail, null) :
          displayError('Une erreur est survenue, veuillez réessayer plus tard', null, null);
        });
      }
                          
    }).done((result) =>
    {
      removeLoader(loader, () =>
      {
        if(document.getElementById('accountAdminLevelConfirmationBackground')) document.getElementById('accountAdminLevelConfirmationBackground').remove();

        if(document.getElementById('currentAccountAdminLevel')) document.getElementById('currentAccountAdminLevel').innerText = document.getElementById('accountLevelSelect').value;
        
        displaySuccess(result.message, null, null);
      });
    });
  });
}

/****************************************************************************************************/