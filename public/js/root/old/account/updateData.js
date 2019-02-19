/****************************************************************************************************/

if(document.getElementById('accountDataUpdateEmail')) document.getElementById('accountDataUpdateEmail').addEventListener('click', openEmailUpdatePopup);
if(document.getElementById('accountDataUpdateLastname')) document.getElementById('accountDataUpdateLastname').addEventListener('click', openLastnameUpdatePopup);
if(document.getElementById('accountDataUpdateFirstname')) document.getElementById('accountDataUpdateFirstname').addEventListener('click', openFirstnameUpdatePopup);
if(document.getElementById('accountDataUpdateContactNumber')) document.getElementById('accountDataUpdateContactNumber').addEventListener('click', openContactNumberUpdatePopup);

var commonStrings = null;

/****************************************************************************************************/

function updateAccountGetStrings(callback)
{
  if(commonStrings != null) return callback();

  displayLoader('', (loader) =>
  {
    getCommonStrings((error, strings) =>
    {
      removeLoader(loader, () => {  });

      if(error != null) return callback(error);

      commonStrings = strings;

      return callback(null);
    });
  });
}

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

  displayLoader('', (loader) =>
  {
    $.ajax(
    {
      type: 'GET', timeout: 5000, dataType: 'JSON', url: '/queries/strings/get-common', success: () => {},
      error: (xhr, status, error) =>
      {
        removeLoader(loader, () =>
        {
          xhr.responseJSON != undefined ?
          displayError(xhr.responseJSON.message, xhr.responseJSON.detail, null) :
          displayError('Une erreur est survenue, veuillez réessayer plus tard', null, null);
        });
      }
                          
    }).done((result) =>
    {
      removeLoader(loader, () => {  });

      commonStrings = result.strings;

      var background  = document.createElement('div');
      var popup       = document.createElement('div');
      var form        = document.createElement('form');

      background      .setAttribute('class', 'standardBackground');
      popup           .setAttribute('class', 'standardPopup');
      form            .setAttribute('class', 'accountDataUpdateForm');

      background      .setAttribute('id', 'accountDataUpdateBackground');
      popup           .setAttribute('id', 'accountDataUpdatePopup');

      popup           .innerHTML += `<div class="standardPopupTitle">${commonStrings.root.account.accountUpdate.emailLabel}</div>`;
      form            .innerHTML += `<input name="emailAddress" placeholder="${commonStrings.root.account.accountUpdate.emailLabel}" type="text" class="accountDataUpdateFormInput" required/><button class="accountDataUpdateFormSubmit" type="submit">${commonStrings.global.save}</button>`;

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

  displayLoader('', (loader) =>
  {
    $.ajax(
    {
      type: 'GET', timeout: 5000, dataType: 'JSON', url: '/queries/strings/get-common', success: () => {},
      error: (xhr, status, error) =>
      {
        removeLoader(loader, () =>
        {
          xhr.responseJSON != undefined ?
          displayError(xhr.responseJSON.message, xhr.responseJSON.detail, null) :
          displayError('Une erreur est survenue, veuillez réessayer plus tard', null, null);
        });
      }
                          
    }).done((result) =>
    {
      removeLoader(loader, () => {  });

      commonStrings = result.strings;

      var background  = document.createElement('div');
      var popup       = document.createElement('div');
      var form        = document.createElement('form');

      background      .setAttribute('class', 'standardBackground');
      popup           .setAttribute('class', 'standardPopup');
      form            .setAttribute('class', 'accountDataUpdateForm');

      background      .setAttribute('id', 'accountDataUpdateBackground');
      popup           .setAttribute('id', 'accountDataUpdatePopup');

      popup           .innerHTML += `<div class="standardPopupTitle">${commonStrings.root.account.accountUpdate.lastnameLabel}</div>`;
      form            .innerHTML += `<input name="lastname" placeholder="${commonStrings.root.account.accountUpdate.lastnameLabel}" type="text" class="accountDataUpdateFormInput" required/><button class="accountDataUpdateFormSubmit" type="submit">${commonStrings.global.save}</button>`;

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

  displayLoader('', (loader) =>
  {
    $.ajax(
    {
      type: 'GET', timeout: 5000, dataType: 'JSON', url: '/queries/strings/get-common', success: () => {},
      error: (xhr, status, error) =>
      {
        removeLoader(loader, () =>
        {
          xhr.responseJSON != undefined ?
          displayError(xhr.responseJSON.message, xhr.responseJSON.detail, null) :
          displayError('Une erreur est survenue, veuillez réessayer plus tard', null, null);
        });
      }
                          
    }).done((result) =>
    {
      removeLoader(loader, () => {  });

      commonStrings = result.strings;

      var background  = document.createElement('div');
      var popup       = document.createElement('div');
      var form        = document.createElement('form');

      background      .setAttribute('class', 'standardBackground');
      popup           .setAttribute('class', 'standardPopup');
      form            .setAttribute('class', 'accountDataUpdateForm');

      background      .setAttribute('id', 'accountDataUpdateBackground');
      popup           .setAttribute('id', 'accountDataUpdatePopup');

      popup           .innerHTML += `<div class="standardPopupTitle">${commonStrings.root.account.accountUpdate.firstnameLabel}</div>`;
      form            .innerHTML += `<input name="firstname" placeholder="${commonStrings.root.account.accountUpdate.firstnameLabel}" type="text" class="accountDataUpdateFormInput" required/><button class="accountDataUpdateFormSubmit" type="submit">${commonStrings.global.save}</button>`;

      background      .addEventListener('click', removePopupAndBackground);

      form            .addEventListener('submit', sendNewFirstnameToServer);

      popup           .appendChild(form);

      document.body   .appendChild(background);
      document.body   .appendChild(popup);
    });
  });
}

/****************************************************************************************************/

function openContactNumberUpdatePopup(event)
{
  if(document.getElementById('accountDataUpdateBackground')) return;

  createBackground('accountDataUpdateBackground');

  updateAccountGetStrings((error) =>
  {
    if(error != null)
    {
      removeBackground('accountDataUpdateBackground');

      return displayError(error.message, error.detail, 'accountDataUpdateError');
    }

    var popup       = document.createElement('div');
    var form        = document.createElement('form');

    popup           .setAttribute('class', 'standardPopup');
    form            .setAttribute('class', 'accountDataUpdateForm');

    popup           .setAttribute('id', 'accountDataUpdatePopup');

    popup           .innerHTML += `<div class="standardPopupTitle">${commonStrings.root.account.accountUpdate.contactNumberLabel}</div>`;

    var formContent = [];

    formContent     .push(`<div class="accountDataUpdateFormRowBlock">`);
    formContent     .push(`<div class="accountDataUpdateFormIndicativeChildBlock"><div class="accountDataUpdateFormIndicativeLabel">${commonStrings.root.account.accountUpdate.contactNumberIndicativeLabel}</div>`);
    formContent     .push(`<div class="accountDataUpdateFormRowBlock"><div class="accountDataUpdateFormIndicativePlus"><i class="fas fa-plus"></i></div><select name="indicative" class="accountDataUpdateFormIndicativeInput" required>`);
    formContent     .push(`<option value="33">33</option>`);
    formContent     .push(`</select></div></div>`);
    formContent     .push(`<div class="accountDataUpdateFormIndicativeChildBlock"><div>${commonStrings.root.account.accountUpdate.contactNumberContentLabel}<div>`);
    formContent     .push(`<input name="number" type="text" class="accountDataUpdateFormIndicativeInput" required/></div>`);
    formContent     .push(`</div>`);

    form            .innerHTML = formContent.join('');

    form            .innerHTML += `<button class="accountDataUpdateFormIndicativeSubmit" type="submit">${commonStrings.global.save}</button>`;

    form            .addEventListener('submit', sendNewContactNumberToServer);

    popup           .appendChild(form);

    document.body   .appendChild(popup);

    document.getElementById('accountDataUpdateBackground').addEventListener('click', removePopupAndBackground);
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
    error         .innerText = commonStrings.root.account.accountUpdate.emailFormatError;
    event.target  .insertBefore(error, event.target.children[0]);
  }

  else
  {
    document.getElementById('accountDataUpdatePopup').style.display = 'none';
    document.getElementById('accountDataUpdateBackground').removeEventListener('click', removePopupAndBackground);

    displayLoader(commonStrings.root.account.accountUpdate.emailSending, (loader) =>
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
            displayError(xhr.responseJSON.message, xhr.responseJSON.detail, null) :
            displayError('Une erreur est survenue, veuillez réessayer plus tard', null, null);
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

          displaySuccess('Votre adresse email a été modifiée', null);
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
    error         .innerText = commonStrings.root.account.accountUpdate.lastnameFormatError;
    event.target  .insertBefore(error, event.target.children[0]);
  }

  else
  {
    document.getElementById('accountDataUpdatePopup').style.display = 'none';
    document.getElementById('accountDataUpdateBackground').removeEventListener('click', removePopupAndBackground);

    displayLoader(commonStrings.root.account.accountUpdate.lastnameSending, (loader) =>
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
            displayError(xhr.responseJSON.message, xhr.responseJSON.detail, null) :
            displayError('Une erreur est survenue, veuillez réessayer plus tard', null, null);
          });
        }
                            
      }).done((result) =>
      {
        removeLoader(loader, () =>
        {
          document.getElementById('accountDataUpdatePopup').remove();
          document.getElementById('accountDataUpdateBackground').remove();

          document.getElementById('accountDataLastname').innerText = `${lastname.charAt(0).toUpperCase()}${lastname.slice(1).toLowerCase()}`;

          displaySuccess('Votre nom a été modifié', null);
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
    error         .innerText = commonStrings.root.account.accountUpdate.firstnameFormatError;
    event.target  .insertBefore(error, event.target.children[0]);
  }

  else
  {
    document.getElementById('accountDataUpdatePopup').style.display = 'none';
    document.getElementById('accountDataUpdateBackground').removeEventListener('click', removePopupAndBackground);

    displayLoader(commonStrings.root.account.accountUpdate.firstnameSending, (loader) =>
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
            displayError(xhr.responseJSON.message, xhr.responseJSON.detail, null) :
            displayError('Une erreur est survenue, veuillez réessayer plus tard', null, null);
          });
        }
                            
      }).done((result) =>
      {
        removeLoader(loader, () =>
        {
          document.getElementById('accountDataUpdatePopup').remove();
          document.getElementById('accountDataUpdateBackground').remove();

          document.getElementById('accountDataFirstname').innerText = `${firstname.charAt(0).toUpperCase()}${firstname.slice(1).toLowerCase()}`;

          displaySuccess('Votre prénom a été modifié', null);
        });
      });
    });
  }
}

/****************************************************************************************************/

function sendNewContactNumberToServer(event)
{
  event.preventDefault();

  if(document.getElementById('accountDataUpdateError')) document.getElementById('accountDataUpdateError').remove();

  const indicative  = event.target.elements['indicative'].value;
  const number      = event.target.elements['number'].value;

  if(new RegExp('^[0-9]+$').test(indicative) == false || new RegExp('^[0-9]+$').test(number) == false)
  {
    var error     = document.createElement('div');
    error         .setAttribute('id', 'accountDataUpdateError');
    error         .setAttribute('class', 'accountDataUpdateError');
    error         .innerText = commonStrings.root.account.accountUpdate.contactNumberFormatError;
    event.target  .insertBefore(error, event.target.children[0]);

    return;
  }

  document.getElementById('accountDataUpdatePopup').style.display = 'none';
  document.getElementById('accountDataUpdateBackground').removeEventListener('click', removePopupAndBackground);

  displayLoader(commonStrings.root.account.accountUpdate.contactNumberSending, (loader) =>
  {
    $.ajax(
    {
      type: 'PUT', timeout: 5000, dataType: 'JSON', data: { number: `${indicative}${number}` }, url: '/queries/root/account/update-contact-number', success: () => {},
      error: (xhr, status, error) =>
      {
        removeLoader(loader, () =>
        {
          document.getElementById('accountDataUpdatePopup').removeAttribute('style');
          document.getElementById('accountDataUpdateBackground').addEventListener('click', removePopupAndBackground);

          xhr.responseJSON != undefined ?
          displayError(xhr.responseJSON.message, xhr.responseJSON.detail, null) :
          displayError('Une erreur est survenue, veuillez réessayer plus tard', null, null);
        });
      }
                          
    }).done((result) =>
    {
      removeLoader(loader, () =>
      {
        document.getElementById('accountDataUpdatePopup').remove();
        document.getElementById('accountDataUpdateBackground').remove();

        document.getElementById('accountDataContactNumber').innerText = `+${indicative}${number}`;

        displaySuccess(commonStrings.root.account.accountUpdate.contactNumberUpdated, null);
      });
    });
  });
}

/****************************************************************************************************/