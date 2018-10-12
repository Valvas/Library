/****************************************************************************************************/

if(document.getElementById('accountDataUpdateEmail')) document.getElementById('accountDataUpdateEmail').addEventListener('click', openEmailUpdatePopup);
if(document.getElementById('accountDataUpdateLastname')) document.getElementById('accountDataUpdateLastname').addEventListener('click', openLastnameUpdatePopup);
if(document.getElementById('accountDataUpdateFirstname')) document.getElementById('accountDataUpdateFirstname').addEventListener('click', openFirstnameUpdatePopup);

var strings = null;

/****************************************************************************************************/

function removePopupAndBackground(event)
{
  document.getElementById('accountDataUpdateBackground').remove();
  document.getElementById('accountDataUpdatePopup').remove();
}

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

      background      .setAttribute('id', 'accountDataUpdateBackground');
      popup           .setAttribute('id', 'accountDataUpdatePopup');

      popup           .innerHTML += `<div class="standardPopupTitle">${strings.root.account.accountUpdate.emailLabel}</div>`;
      form            .innerHTML += `<input name="emailAddress" placeholder="${strings.root.account.accountUpdate.emailLabel}" type="text" class="accountDataUpdateFormInput" required/><button class="accountDataUpdateFormSubmit" type="submit">${strings.global.save}</button>`;

      background      .addEventListener('click', removePopupAndBackground);

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

      background      .setAttribute('id', 'accountDataUpdateBackground');
      popup           .setAttribute('id', 'accountDataUpdatePopup');

      popup           .innerHTML += `<div class="standardPopupTitle">${strings.root.account.accountUpdate.lastnameLabel}</div>`;
      form            .innerHTML += `<input name="lastname" placeholder="${strings.root.account.accountUpdate.lastnameLabel}" type="text" class="accountDataUpdateFormInput" required/><button class="accountDataUpdateFormSubmit" type="submit">${strings.global.save}</button>`;

      background      .addEventListener('click', removePopupAndBackground);

      form            .addEventListener('submit', sendNewLastnameToServer);

      popup           .appendChild(form);

      document.body   .appendChild(background);
      document.body   .appendChild(popup);
    });
  });
}

/****************************************************************************************************/

function openFirstnameUpdatePopup(event)
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

      background      .setAttribute('id', 'accountDataUpdateBackground');
      popup           .setAttribute('id', 'accountDataUpdatePopup');

      popup           .innerHTML += `<div class="standardPopupTitle">${strings.root.account.accountUpdate.firstnameLabel}</div>`;
      form            .innerHTML += `<input name="firstname" placeholder="${strings.root.account.accountUpdate.firstnameLabel}" type="text" class="accountDataUpdateFormInput" required/><button class="accountDataUpdateFormSubmit" type="submit">${strings.global.save}</button>`;

      background      .addEventListener('click', removePopupAndBackground);

      form            .addEventListener('submit', sendNewFirstnameToServer);

      popup           .appendChild(form);

      document.body   .appendChild(background);
      document.body   .appendChild(popup);
    });
  });
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
    document.getElementById('accountDataUpdateBackground').removeEventListener('click', removePopupAndBackground);

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
            document.getElementById('accountDataUpdateBackground').addEventListener('click', removePopupAndBackground);

            xhr.responseJSON != undefined ?
            displayError('Erreur', xhr.responseJSON.message, xhr.responseJSON.detail) :
            displayError('Erreur', 'Une erreur est survenue, veuillez réessayer plus tard', null);
          });
        }
                            
      }).done((result) =>
      {
        removeLoader(loader, () =>
        {
          document.getElementById('accountDataUpdatePopup').remove();
          document.getElementById('accountDataUpdateBackground').remove();

          document.getElementById('accountDataEmail').innerText = emailAddress;

          if(document.getElementById('headerBlockNavigationAccountBlock')) document.getElementById('headerBlockNavigationAccountBlock').children[0].innerText = emailAddress

          displaySuccess('Succès', 'Votre adresse email a été modifiée', null);
        });
      });
    });
  }
}

/****************************************************************************************************/

function sendNewLastnameToServer(event)
{
  event.preventDefault();

  if(document.getElementById('accountDataUpdateError')) document.getElementById('accountDataUpdateError').remove();

  const lastname = event.target.elements['lastname'].value;

  if(new RegExp('^[a-zA-ZÈÉÊËÎÏèéêëîïâäÂÄ]+(-)?[a-zA-ZÈÉÊËÎÏèéêëîïâäÂÄ]+$').test(lastname) == false)
  {
    var error     = document.createElement('div');
    error         .setAttribute('id', 'accountDataUpdateError');
    error         .setAttribute('class', 'accountDataUpdateError');
    error         .innerText = strings.root.account.accountUpdate.lastnameFormatError;
    event.target  .insertBefore(error, event.target.children[0]);
  }

  else
  {
    document.getElementById('accountDataUpdatePopup').style.display = 'none';
    document.getElementById('accountDataUpdateBackground').removeEventListener('click', removePopupAndBackground);

    displayLoader(strings.global.loading, strings.root.account.accountUpdate.lastnameSending, null, (loader) =>
    {
      $.ajax(
      {
        type: 'PUT', timeout: 5000, dataType: 'JSON', data: { lastname: lastname }, url: '/queries/root/account/update-lastname', success: () => {},
        error: (xhr, status, error) =>
        {
          removeLoader(loader, () =>
          {
            document.getElementById('accountDataUpdatePopup').removeAttribute('style');
            document.getElementById('accountDataUpdateBackground').addEventListener('click', removePopupAndBackground);

            xhr.responseJSON != undefined ?
            displayError('Erreur', xhr.responseJSON.message, xhr.responseJSON.detail) :
            displayError('Erreur', 'Une erreur est survenue, veuillez réessayer plus tard', null);
          });
        }
                            
      }).done((result) =>
      {
        removeLoader(loader, () =>
        {
          document.getElementById('accountDataUpdatePopup').remove();
          document.getElementById('accountDataUpdateBackground').remove();

          document.getElementById('accountDataLastname').innerText = lastname;

          displaySuccess('Succès', 'Votre nom a été modifié', null);
        });
      });
    });
  }
}

/****************************************************************************************************/

function sendNewFirstnameToServer(event)
{
  event.preventDefault();

  if(document.getElementById('accountDataUpdateError')) document.getElementById('accountDataUpdateError').remove();

  const firstname = event.target.elements['firstname'].value;

  if(new RegExp('^[a-zA-ZÈÉÊËÎÏèéêëîïâäÂÄ]+(-)?[a-zA-ZÈÉÊËÎÏèéêëîïâäÂÄ]+$').test(firstname) == false)
  {
    var error     = document.createElement('div');
    error         .setAttribute('id', 'accountDataUpdateError');
    error         .setAttribute('class', 'accountDataUpdateError');
    error         .innerText = strings.root.account.accountUpdate.firstnameFormatError;
    event.target  .insertBefore(error, event.target.children[0]);
  }

  else
  {
    document.getElementById('accountDataUpdatePopup').style.display = 'none';
    document.getElementById('accountDataUpdateBackground').removeEventListener('click', removePopupAndBackground);

    displayLoader(strings.global.loading, strings.root.account.accountUpdate.firstnameSending, null, (loader) =>
    {
      $.ajax(
      {
        type: 'PUT', timeout: 5000, dataType: 'JSON', data: { firstname: firstname }, url: '/queries/root/account/update-firstname', success: () => {},
        error: (xhr, status, error) =>
        {
          removeLoader(loader, () =>
          {
            document.getElementById('accountDataUpdatePopup').removeAttribute('style');
            document.getElementById('accountDataUpdateBackground').addEventListener('click', removePopupAndBackground);

            xhr.responseJSON != undefined ?
            displayError('Erreur', xhr.responseJSON.message, xhr.responseJSON.detail) :
            displayError('Erreur', 'Une erreur est survenue, veuillez réessayer plus tard', null);
          });
        }
                            
      }).done((result) =>
      {
        removeLoader(loader, () =>
        {
          document.getElementById('accountDataUpdatePopup').remove();
          document.getElementById('accountDataUpdateBackground').remove();

          document.getElementById('accountDataFirstname').innerText = firstname;

          displaySuccess('Succès', 'Votre prénom a été modifié', null);
        });
      });
    });
  }
}

/****************************************************************************************************/