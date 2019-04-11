/****************************************************************************************************/

'use strict'

let pageTitle = document.title;
let appStrings = null;
let commonStrings = null;
let accountData = null;
let messengerData = null;
let currentLocation = window.location.href.split('/').length > 4 ? window.location.href.split('/')[4] : 'home';
let urlParameters = window.location.href.split('/').slice(5);

urlParameters = urlParameters.filter(param => param.length > 0);

initializeStart();

/****************************************************************************************************/

function initializeStart()
{
  if(document.getElementById('initializationError'))
  {
    document.getElementById('initializationError').remove();
  }

  const loader = document.createElement('div');

  loader    .setAttribute('id', 'initializationLoader');
  loader    .setAttribute('class', 'loaderVerticalContainer');
  loader    .innerHTML = '<div class="loaderHorizontalContainer"><div class="loaderSpinner"></div></div>';

  document.body.appendChild(loader);

  initializeRetrieveStrings((error) =>
  {
    if(error !== null)
    {
      return displayError(error.message, error.detail, 'initializationError');
    }

    $(loader).fadeOut(500, () =>
    {
      loader.remove();

      createHeader((error) =>
      {
        if(error !== null)
        {
          return displayError(error.message, error.detail, 'initializationError');
        }

        loadLocation(currentLocation);
      });
    });
  });
}

/****************************************************************************************************/
/* Retrieve Strings From API */
/****************************************************************************************************/

function initializeRetrieveStrings(callback)
{
  $.ajax(
  {
    method: 'GET', timeout: 5000, dataType: 'JSON', url: '/queries/strings/get-sick', success: () => {},
    error: (xhr, status, error) =>
    {
      xhr.responseJSON != undefined ?
      callback({ message: xhr.responseJSON.message, detail: xhr.responseJSON.detail }) :
      callback({ message: 'Une erreur est survenue, veuillez réessayer plus tard', detail: null });
    }

  }).done((strings) =>
  {
    appStrings = strings.app;
    commonStrings = strings.common;

    return retrieveAccountData(callback);
  });
}

/****************************************************************************************************/
/* Retrieve Account Data From API */
/****************************************************************************************************/

function retrieveAccountData(callback)
{
  $.ajax(
  {
    method: 'GET', dataType: 'json', timeout: 5000, url: '/queries/root/account/get-account-data',
    error: (xhr, textStatus, errorThrown) =>
    {
      xhr.responseJSON != undefined ?
      callback({ message: xhr.responseJSON.message, detail: xhr.responseJSON.detail }) :
      callback({ message: 'Une erreur est survenue, veuillez réessayer plus tard', detail: null });
    }

  }).done((result) =>
  {
    accountData = result;

    return retrieveMessengerData(callback);
  });
}

/****************************************************************************************************/
/* Retrieve Messenger Data From API */
/****************************************************************************************************/

function retrieveMessengerData(callback)
{
  $.ajax(
  {
    method: 'GET', dataType: 'json', timeout: 5000, url: '/api/messenger/get-messenger-data',
    error: (xhr, textStatus, errorThrown) =>
    {
      xhr.responseJSON != undefined ?
      callback({ message: xhr.responseJSON.message, detail: xhr.responseJSON.detail }) :
      callback({ message: 'Une erreur est survenue, veuillez réessayer plus tard', detail: null });
    }

  }).done((result) =>
  {
    messengerData = result.messengerData;

    return callback(null);
  });
}

/****************************************************************************************************/
