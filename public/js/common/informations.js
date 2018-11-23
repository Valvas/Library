/****************************************************************************************************/

function checkMessageTag(messageTag)
{
  if(document.getElementById('informationBlock') == null) return;

  const currentMessages = document.getElementById('informationBlock').children;

  for(var x = 0; x < currentMessages.length; x++)
  {
    if(currentMessages[x].getAttribute('tag') === messageTag) currentMessages[x].remove();
  }
}

/****************************************************************************************************/

function displayInfo(message, detail, messageTag)
{
  if(document.getElementById('informationBlock') == null) return;

  if(messageTag != null) checkMessageTag(messageTag);

  var block = document.createElement('div');

  block.setAttribute('class', 'informationBlockMessageInfo');

  if(messageTag != null) block.setAttribute('tag', messageTag);

  detail == null 
  ? block.innerHTML += `<div class="informationBlockMessageContent">${message}</div>`
  : block.innerHTML += `<div class="informationBlockMessageContent"><div>${message}</div><div class="informationBlockMessageDetail">${detail}</div></div>`;
  
  block.innerHTML += `<button onclick="closeDisplayedMessage(this.parentNode)" class="informationBlockMessageClose">FERMER</div>`;

  $(block).hide().appendTo(document.getElementById('informationBlock'));

  $(block).slideDown(250, () =>
  {
    setTimeout(() => { $(block).slideUp(250, () =>{ block.remove(); }); }, 8000);
  });
}

/****************************************************************************************************/

function displayError(message, detail, messageTag)
{
  if(document.getElementById('informationBlock') == null) return;

  if(messageTag != null) checkMessageTag(messageTag);

  var block = document.createElement('div');

  block.setAttribute('class', 'informationBlockMessageError');

  if(messageTag != null) block.setAttribute('tag', messageTag);

  detail == null 
  ? block.innerHTML += `<div class="informationBlockMessageContent">${message}</div>`
  : block.innerHTML += `<div class="informationBlockMessageContent"><div>${message}</div><div class="informationBlockMessageDetail">${detail}</div></div>`;


  block.innerHTML += `<button onclick="closeDisplayedMessage(this.parentNode)" class="informationBlockMessageClose">FERMER</div>`;

  $(block).hide().appendTo(document.getElementById('informationBlock'));

  $(block).slideDown(250, () =>
  {
    setTimeout(() => { $(block).slideUp(250, () =>{ block.remove(); }); }, 60000);
  });
}

/****************************************************************************************************/

function displaySuccess(message, detail, messageTag)
{
  if(document.getElementById('informationBlock') == null) return;

  if(messageTag != null) checkMessageTag(messageTag);

  var block = document.createElement('div');

  block.setAttribute('class', 'informationBlockMessageSuccess');

  if(messageTag != null) block.setAttribute('tag', messageTag);

  block.innerHTML += `<div class="informationBlockMessageContent">${message}</div>`;
  block.innerHTML += `<button onclick="closeDisplayedMessage(this.parentNode)" class="informationBlockMessageClose">FERMER</div>`;

  $(block).hide().appendTo(document.getElementById('informationBlock'));

  $(block).slideDown(250, () =>
  {
    setTimeout(() => { $(block).slideUp(250, () =>{ block.remove(); }); }, 8000);
  });
}

/****************************************************************************************************/

function displayLoader(message, callback)
{
  if(document.getElementById('informationBlock') == null) return;
  {
    var block = document.createElement('div');

    block.setAttribute('class', 'informationBlockMessageLoader');

    block.innerHTML += `<div class="informationBlockMessageLoaderIcon"><i class="fas fa-cog fa-spin"></i></div>`;
    block.innerHTML += `<div class="informationBlockMessageLoaderText">${message}</div>`;

    $(block).hide().appendTo(document.getElementById('informationBlock'));

    $(block).slideDown(250, () => { callback(block); });
  }
}

/****************************************************************************************************/

function removeLoader(loaderToRemove, callback)
{
  if(loaderToRemove)
  {
    $(loaderToRemove).slideUp(250, () =>
    {
      loaderToRemove.remove();

      return callback();
    });
  }
}

/****************************************************************************************************/

function closeDisplayedMessage(block)
{
  $(block).slideUp(250, () =>{ block.remove(); });
}

/****************************************************************************************************/

function displayCriticalErrorMessage(errorTitle, errorMessage, errorDetail, errorHelp, errorClose)
{
  createBackground('criticalErrorMessageBackground');

  var criticalPopup = document.createElement('div');

  criticalPopup.setAttribute('class', 'criticalPopup');

  criticalPopup.innerHTML += `<div class="criticalPopupTitle">${errorTitle.toUpperCase()}</div>`;
  criticalPopup.innerHTML += `<div class="criticalPopupMessage">${errorMessage.charAt(0).toUpperCase()}${errorMessage.slice(1)}</div>`;
  if(errorDetail != null) criticalPopup.innerHTML += `<div class="criticalPopupDetail">${errorDetail.charAt(0).toUpperCase()}${errorDetail.slice(1)}</div>`;
  if(errorHelp != null) criticalPopup.innerHTML += `<div class="criticalPopupHelp">${errorHelp.charAt(0).toUpperCase()}${errorHelp.slice(1)}</div>`;

  var criticalPopupClose = document.createElement('button');

  criticalPopupClose.setAttribute('class', 'criticalPopupClose');

  criticalPopupClose.innerText = errorClose;

  criticalPopupClose.addEventListener('click', () =>
  {
    criticalPopup.remove();
    removeBackground('criticalErrorMessageBackground');
  });

  criticalPopup.appendChild(criticalPopupClose);

  document.body.appendChild(criticalPopup);
}

/****************************************************************************************************/