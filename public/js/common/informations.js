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

  block.innerHTML += `<div class="informationBlockMessageContent">${message}</div>`;
  block.innerHTML += `<button onclick="closeDisplayedMessage(this.parentNode)" class="informationBlockMessageClose">FERMER</div>`;

  $(block).hide().appendTo(document.getElementById('informationBlock'));

  $(block).slideDown(250, () =>
  {
    setTimeout(() => { $(block).slideUp(250, () =>{ block.remove(); }); }, 15000);
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

  block.innerHTML += `<div class="informationBlockMessageContent">${message}</div>`;
  block.innerHTML += `<button onclick="closeDisplayedMessage(this.parentNode)" class="informationBlockMessageClose">FERMER</div>`;

  $(block).hide().appendTo(document.getElementById('informationBlock'));

  $(block).slideDown(250, () =>
  {
    setTimeout(() => { $(block).slideUp(250, () =>{ block.remove(); }); }, 15000);
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
    setTimeout(() => { $(block).slideUp(250, () =>{ block.remove(); }); }, 15000);
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