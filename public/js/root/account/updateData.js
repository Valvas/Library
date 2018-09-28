/****************************************************************************************************/

if(document.getElementById('accountDataUpdateEmail')) document.getElementById('accountDataUpdateEmail').addEventListener('click', openEmailUpdatePopup);
if(document.getElementById('accountDataUpdateLastname')) document.getElementById('accountDataUpdateLastname').addEventListener('click', openLastnameUpdatePopup);
if(document.getElementById('accountDataUpdateFirstname')) document.getElementById('accountDataUpdateFirstname').addEventListener('click', openFirstnameUpdatePopup);

var strings = null;

/****************************************************************************************************/

function openEmailUpdatePopup(event)
{
  if(document.getElementById('accountDataUpdatePopup')) return;

  displayLoader('', '', null, (loader) =>
  {
    $.ajax(
    {
      type: 'GET', timeout: 5000, dataType: 'JSON', url: '/queries/strings/get-common', success: () => {},
      error: (xhr, status, error) =>
      {
        removeLoader(loader, () =>
        {
          xhr.responseJSON != undefined ?
          displayError('Erreur', xhr.responseJSON.message, xhr.responseJSON.detail) :
          displayError('Erreur', 'Une erreur est survenue, veuillez réessayer plus tard', null);
        });
      }
                          
    }).done((result) =>
    {
      removeLoader(loader, () => {  });

      strings = result.strings;

      var background  = document.createElement('div');
      var popup       = document.createElement('div');
      var form        = document.createElement('form');

      background      .setAttribute('class', 'standardBackground');
      popup           .setAttribute('class', 'standardPopup');
      form            .setAttribute('class', 'accountDataUpdateForm');

      popup           .setAttribute('id', 'accountDataUpdatePopup');

      popup           .innerHTML += `<div class="standardPopupTitle">${strings.root.account.accountUpdate.emailLabel}</div>`;
      form            .innerHTML += `<input name="emailAddress" placeholder="${strings.root.account.accountUpdate.emailLabel}" type="text" class="accountDataUpdateFormInput" required/><button class="accountDataUpdateFormSubmit" type="submit">${strings.global.save}</button>`;

      background.addEventListener('click', () =>
      {
        popup.remove();
        background.remove();
      });

      form            .addEventListener('submit', sendNewEmailAddressToServer);

      popup           .appendChild(form);

      document.body   .appendChild(background);
      document.body   .appendChild(popup);
    });
  });
}

/****************************************************************************************************/

function openLastnameUpdatePopup(event)
{

}

/****************************************************************************************************/

function openFirstnameUpdatePopup(event)
{

}

/****************************************************************************************************/

function sendNewEmailAddressToServer(event)
{
  event.preventDefault();

  if(document.getElementById('accountDataUpdateError')) document.getElementById('accountDataUpdateError').remove();

  const emailAddress = event.target.elements['emailAddress'].value;

  if(new RegExp('^[a-zA-Z][\\w\\.-]*[a-zA-Z0-9]@[a-zA-Z0-9][\\w\\.-]*[a-zA-Z0-9]\\.[a-zA-Z][a-zA-Z\\.]*[a-zA-Z]$').test(emailAddress) == false)
  {
    var error     = document.createElement('div');
    error         .setAttribute('id', 'accountDataUpdateError');
    error         .setAttribute('class', 'accountDataUpdateError');
    error         .innerText = strings.root.account.accountUpdate.emailFormatError;
    event.target  .insertBefore(error, event.target.children[0]);
  }

  else
  {
    document.getElementById('accountDataUpdatePopup').style.display = 'none';

    displayLoader(strings.global.loading, strings.root.account.accountUpdate.emailSending, null, (loader) =>
    {
      $.ajax(
      {
        type: 'PUT', timeout: 5000, dataType: 'JSON', data: { emailAddress: emailAddress }, url: '/queries/root/account/update-email-address', success: () => {},
        error: (xhr, status, error) =>
        {
          removeLoader(loader, () =>
          {
            document.getElementById('accountDataUpdatePopup').removeAttribute('style');

            xhr.responseJSON != undefined ?
            displayError('Erreur', xhr.responseJSON.message, xhr.responseJSON.detail) :
            displayError('Erreur', 'Une erreur est survenue, veuillez réessayer plus tard', null);
          });
        }
                            
      }).done((result) =>
      {
        document.getElementById('accountDataUpdatePopup').remove();
      });
    });
  }
}

/****************************************************************************************************/