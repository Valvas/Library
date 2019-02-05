/****************************************************************************************************/

var commonStrings = null;
var accountData = null;
var articlesData = null;
var currentLocation = window.location.href.split('/')[3];

//To remove when tests are over
currentLocation = 'account';

initializeStart();

/****************************************************************************************************/

function initializeStart()
{
  if(document.getElementById('initializationError')) document.getElementById('initializationError').remove();

  var loader  = document.createElement('div');

  loader      .setAttribute('id', 'initializationLoader');
  loader      .setAttribute('class', 'loaderVerticalContainer');
  loader      .innerHTML = '<div class="loaderHorizontalContainer"><div class="loaderSpinner"></div></div>';

  document.body.appendChild(loader);

  initializeRetrieveStrings((error) =>
  {
    if(error) return displayError(error.message, error.detail, 'initializationError');

    createHeader(() =>
    {
      var locationContent = document.createElement('div');

      locationContent.setAttribute('id', 'locationContent');

      document.getElementById('contentContainer').appendChild(locationContent);

      loader.remove();

      loadLocation(currentLocation);
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

    return retrieveArticlesData(callback);
  });
}

/****************************************************************************************************/
/* Retrieve Last Articles From API */
/****************************************************************************************************/

function retrieveArticlesData(callback)
{
  $.ajax(
  {
    method: 'GET', dataType: 'json', data: {  }, timeout: 5000, url: '/queries/root/news/get-last-articles',

    error: (xhr, textStatus, errorThrown) =>
    {
      xhr.responseJSON != undefined ?
      callback({ message: xhr.responseJSON.message, detail: xhr.responseJSON.detail }) :
      callback({ message: 'Une erreur est survenue, veuillez réessayer plus tard', detail: null });
    }

  }).done((result) =>
  {
    articlesData = result.articlesData;

    return callback(null);
  });
}

/****************************************************************************************************/
