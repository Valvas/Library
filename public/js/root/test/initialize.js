/****************************************************************************************************/

var commonStrings = null;
var accountData = null;
var articlesData = null;

initializeStart();

/****************************************************************************************************/

function initializeStart()
{
  if(document.getElementById('initializationError')) document.getElementById('initializationError').remove();

  var loader  = document.createElement('div');

  loader      .setAttribute('id', 'initializationLoader');
  loader      .setAttribute('class', 'initializationVerticalContainer');
  loader      .innerHTML = '<div class="initializationHorizontalContainer"><div class="initializationLoader"></div></div>';

  document.body.appendChild(loader);

  initializeRetrieveStrings((error) =>
  {
    if(error) return displayInitializationError(error.message, error.detail);

    createHeader(() =>
    {
      loader.remove();
    });
  });
}

/****************************************************************************************************/
/* Retrieve Strings From Server */
/****************************************************************************************************/

function initializeRetrieveStrings(callback)
{
  $.ajax(
  {
    type: 'GET', timeout: 5000, dataType: 'JSON', url: '/queries/strings/get-common', success: () => {},
    error: (xhr, status, error) =>
    {
      xhr.responseJSON != undefined ?
      callback({ message: xhr.responseJSON.message, detail: xhr.responseJSON.detail }) :
      callback({ message: 'Une erreur est survenue, veuillez réessayer plus tard', detail: null });
    }

  }).done((result) =>
  {
    commonStrings = result.strings;

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

    return callback(null);
  });
}

/****************************************************************************************************/
/* Display An Error If One Happens During Initialization */
/****************************************************************************************************/

function displayInitializationError(errorMessage, errorDetail)
{
  if(document.getElementById('initializationLoader')) document.getElementById('initializationLoader').remove();

  var error   = document.createElement('div');

  error       .setAttribute('id', 'initializationError');
  error       .setAttribute('class', 'initializationVerticalContainer');
  error       .innerHTML = `<div class="initializationHorizontalContainer"><div class="initializationError"><div class="initializationErrorMessage"></div><div class="initializationErrorDetail"></div></div></div>`;

  document.body.appendChild(error);
}

/****************************************************************************************************/
