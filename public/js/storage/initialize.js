/****************************************************************************************************/

var pageTitle = document.title;
var accountData = null;
var servicesData = null;
var messengerData = null;
var commonStrings = null;
var storageStrings = null;
var selectedDisplay = null;
var currentServiceAccountRights = null;
var currentLocation = window.location.href.split('/')[4];
var urlParameters = window.location.href.split('/').slice(5);

if(currentLocation == undefined || currentLocation.length === 0) currentLocation = 'home';

//TO REMOVE WHEN ADMIN SECTION IS DONE
if(currentLocation === 'admin') window.location = '/storage/admin';

urlParameters = urlParameters.filter(param => param.length > 0);

initializeStart();

/****************************************************************************************************/

function initializeStart()
{
  if(document.getElementById('initializationError')) document.getElementById('initializationError').remove();

  var loader  = document.createElement('div');

  loader      .setAttribute('id', 'loaderContainer');
  loader      .innerHTML = '<div id="loaderWrapper"><div id="loaderSpinner"></div></div>';

  document.body.appendChild(loader);

  const cookies = document.cookie.split(';');

  cookies.forEach((element) =>
  {
    const correctedElement = element.trim();

    if(correctedElement.split('=')[0] === 'storageDisplay')
    {
      selectedDisplay = correctedElement.split('=')[1];
    }
  });

  initializeRetrieveStrings((error) =>
  {
    if(error) return displayError(error.message, error.detail, 'initializationError');

    createNavigation(() =>
    {
      var contentContainer = document.createElement('div');

      contentContainer.setAttribute('id', 'contentContainer');

      document.getElementById('wrapperContainer').appendChild(contentContainer);

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
    type: 'GET', timeout: 5000, dataType: 'JSON', url: '/queries/strings/get-storage', success: () => {},
    error: (xhr, status, error) =>
    {
      xhr.responseJSON != undefined ?
      callback({ message: xhr.responseJSON.message, detail: xhr.responseJSON.detail }) :
      callback({ message: 'Une erreur est survenue, veuillez réessayer plus tard', detail: null });
    }

  }).done((result) =>
  {
    commonStrings = result.common;
    storageStrings = result.storage;

    return retrieveAccountData(callback);
  });
}

/****************************************************************************************************/
/* Retrieve Account Data From Server */
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
/* Retrieve Messenger Data From Server */
/****************************************************************************************************/

function retrieveMessengerData(callback)
{
  $.ajax(
  {
    method: 'GET', dataType: 'json', data: {  }, timeout: 5000, url: '/api/messenger/get-messenger-data',

    error: (xhr, textStatus, errorThrown) =>
    {
      xhr.responseJSON != undefined ?
      callback({ message: xhr.responseJSON.message, detail: xhr.responseJSON.detail }) :
      callback({ message: 'Une erreur est survenue, veuillez réessayer plus tard', detail: null });
    }

  }).done((result) =>
  {
    messengerData = result.messengerData;

    return retrieveServicesData(callback);
  });
}

/****************************************************************************************************/
/* Retrieve Services Data From Server */
/****************************************************************************************************/

function retrieveServicesData(callback)
{
  $.ajax(
  {
    method: 'GET', dataType: 'json', data: {  }, timeout: 5000, url: '/queries/storage/services/get-services',

    error: (xhr, textStatus, errorThrown) =>
    {
      xhr.responseJSON != undefined ?
      callback({ message: xhr.responseJSON.message, detail: xhr.responseJSON.detail }) :
      callback({ message: 'Une erreur est survenue, veuillez réessayer plus tard', detail: null });
    }

  }).done((result) =>
  {
    servicesData = result;

    return callback(null);
  });
}

/****************************************************************************************************/
