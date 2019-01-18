/****************************************************************************************************/
/* Display The Loader */
/****************************************************************************************************/

function displayMessengerLoader(loadingMessage, callback)
{
  if(document.getElementById('messengerHidden') == null) return displayMessengerError(commonStrings.messenger.genericErrorMessage, true);

  var loadingBlock  = document.createElement('div');

  loadingBlock      .setAttribute('class', 'messengerLoader');

  loadingBlock      .innerHTML += `<div class="messengerLoaderIcon"><i class="fas fa-cog fa-spin"></i></div>`;
  loadingBlock      .innerHTML += `<div>${loadingMessage}</div>`;

  document.getElementById('messengerHidden').appendChild(loadingBlock);

  return callback(loadingBlock);
}

/****************************************************************************************************/
/* Display An Error In Messenger Container */
/****************************************************************************************************/

function displayMessengerError(errorMessage, displayCloseButton)
{
  if(document.getElementById('messengerHidden') == null) return displayMessengerError(commonStrings.messenger.genericErrorMessage, true);

  var errorBlock  = document.createElement('div');

  errorBlock      .setAttribute('class', 'messengerError');

  errorBlock      .innerHTML += `<div class="messengerErrorMessage">${errorMessage}</div>`;

  if(displayCloseButton)
  {
    var closeButton = document.createElement('button');

    closeButton     .setAttribute('class', 'messengerErrorClose');

    closeButton     .innerText = commonStrings.messenger.closeButton;

    closeButton     .addEventListener('click', () =>
    {
      errorBlock.remove();
    });

    errorBlock      .appendChild(closeButton);
  }

  document.getElementById('messengerHidden').appendChild(errorBlock);
}

/****************************************************************************************************/
/* Display An Information In Messenger Container */
/****************************************************************************************************/

function displayMessengerInfo(infoMessage)
{
  if(document.getElementById('messengerHidden') == null) return displayMessengerError(commonStrings.messenger.genericErrorMessage, true);

  var infoBlock   = document.createElement('div');

  infoBlock       .setAttribute('class', 'messengerInfo');

  infoBlock       .innerHTML += `<div class="messengerInfoMessage">${infoMessage}</div>`;

  var closeButton = document.createElement('button');

  closeButton     .setAttribute('class', 'messengerInfoClose');

  closeButton     .innerText = commonStrings.messenger.closeButton;

  closeButton     .addEventListener('click', () =>
  {
    infoBlock.remove();
  });

  infoBlock       .appendChild(closeButton);

  document.getElementById('messengerHidden').appendChild(infoBlock);
}

/****************************************************************************************************/