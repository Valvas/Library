/****************************************************************************************************/

function displayErrorMessage(errorMessage, errorDetail)
{
  if(errorMessage !== '')
  {
    var background    = document.createElement('div');
    var block         = document.createElement('div');
    var message       = document.createElement('div');
    var detail        = document.createElement('div');
    var close         = document.createElement('button');

    background        .setAttribute('class', 'storageBackground');
    block             .setAttribute('class', 'storagePopup');
    message           .setAttribute('class', 'storagePopupErrorBlockMessage');
    detail            .setAttribute('class', 'storagePopupBlockDetail');
    close             .setAttribute('class', 'storagePopupBlockClose');

    close             .addEventListener('click', () => { block.remove(); background.remove(); });

    message           .innerText = errorMessage;
    close             .innerText = 'OK';

    block             .appendChild(message);

    if(errorDetail !== '')
    {
      detail          .innerText = errorDetail;
      block           .appendChild(detail);
    }
    
    block             .appendChild(close);

    document.body     .appendChild(background);
    document.body     .appendChild(block);
  }
}

/****************************************************************************************************/

function displaySuccessMessage(successMessage, successDetail)
{
  if(successMessage !== '')
  {
    var background    = document.createElement('div');
    var block         = document.createElement('div');
    var message       = document.createElement('div');
    var detail        = document.createElement('div');
    var close         = document.createElement('button');

    background        .setAttribute('class', 'storageBackground');
    block             .setAttribute('class', 'storagePopup');
    message           .setAttribute('class', 'storagePopupMessage');
    detail            .setAttribute('class', 'storagePopupBlockDetail');
    close             .setAttribute('class', 'storagePopupBlockClose');

    close             .addEventListener('click', () => { block.remove(); background.remove(); });

    message           .innerText = successMessage;
    close             .innerText = 'OK';

    block             .appendChild(message);

    if(successDetail !== '')
    {
      detail          .innerText = successDetail;
      block           .appendChild(detail);
    }
    
    block             .appendChild(close);

    document.body     .appendChild(background);
    document.body     .appendChild(block);
  }
}

/****************************************************************************************************/

function displayErrorToInformationBlock(messageToDisplay)
{
  if(document.getElementById('storageInformationsBlock'))
  {
    var errorMessageBlock = document.createElement('div');

    errorMessageBlock.setAttribute('class', 'informationsBlockError');

    errorMessageBlock.innerText = messageToDisplay;

    $(errorMessageBlock).hide().appendTo(document.getElementById('storageInformationsBlock'));

    $(errorMessageBlock).slideDown(250, () =>
    {
      setTimeout(() =>
      {
        $(errorMessageBlock).slideUp(250, () => { errorMessageBlock.remove(); });
      }, 5000);
    });
  }
}

/****************************************************************************************************/

function displayMessageToInformationBlock(messageToDisplay)
{
  if(document.getElementById('storageInformationsBlock'))
  {
    var messageBlock = document.createElement('div');

    messageBlock.setAttribute('class', 'informationsBlockMessage');

    messageBlock.innerText = messageToDisplay;

    $(messageBlock).hide().appendTo(document.getElementById('storageInformationsBlock'));

    $(messageBlock).slideDown(250, () =>
    {
      setTimeout(() =>
      {
        $(messageBlock).slideUp(250, () => { messageBlock.remove(); });
      }, 5000);
    });
  }
}

/****************************************************************************************************/

function displaySuccessToInformationBlock(messageToDisplay)
{
  if(document.getElementById('storageInformationsBlock'))
  {
    var successMessageBlock = document.createElement('div');

    successMessageBlock.setAttribute('class', 'informationsBlockSuccess');

    successMessageBlock.innerText = messageToDisplay;

    $(successMessageBlock).hide().appendTo(document.getElementById('storageInformationsBlock'));

    $(successMessageBlock).slideDown(250, () =>
    {
      setTimeout(() =>
      {
        $(successMessageBlock).slideUp(250, () => { successMessageBlock.remove(); });
      }, 5000);
    });
  }
}

/****************************************************************************************************/