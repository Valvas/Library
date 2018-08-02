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