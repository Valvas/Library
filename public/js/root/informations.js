/****************************************************************************************************/

function checkMessageTag(messageTag)
{
  if(document.getElementById('informationBlock'))
  {
    const currentMessages = document.getElementById('informationBlock').children;

    for(var x = 0; x < currentMessages.length; x++)
    {
      if(currentMessages[x].getAttribute('tag') === messageTag) currentMessages[x].remove();
    }
  }
}

/****************************************************************************************************/

function displayInfo(title, message, detail, messageTag)
{
  if(document.getElementById('informationBlock'))
  {
    checkMessageTag(messageTag);

    var block = document.createElement('div');

    block.setAttribute('class', 'informationBlockMessage');

    if(messageTag != null && messageTag != undefined) block.setAttribute('tag', messageTag);

    block.innerHTML += `<div class="informationBlockMessageTitleInfo"><div class="informationBlockMessageTitleIcon"><i class="fas fa-info-circle"></i></div><div class="informationBlockMessageTitleText">${title}</div></div>`;
    block.innerHTML += `<div class="informationBlockMessageContent">${message}</div>`;

    if(detail != null) block.innerHTML += `<div class="informationBlockMessageDetail">${detail}</div>`;

    $(block).hide().appendTo(document.getElementById('informationBlock'));

    $(block).slideDown(250, () =>
    {
      setTimeout(() => { $(block).slideUp(250, () =>{ block.remove(); }); }, 5000);
    });
  }
}

/****************************************************************************************************/

function displayError(title, message, detail, messageTag)
{
  if(document.getElementById('informationBlock'))
  {
    checkMessageTag(messageTag);
    
    var block = document.createElement('div');

    block.setAttribute('class', 'informationBlockMessage');

    if(messageTag != null && messageTag != undefined) block.setAttribute('tag', messageTag);

    block.innerHTML += `<div class="informationBlockMessageTitleError"><div class="informationBlockMessageTitleIcon"><i class="fas fa-times-circle"></i></div><div class="informationBlockMessageTitleText">${title}</div></div>`;
    block.innerHTML += `<div class="informationBlockMessageContent">${message}</div>`;

    if(detail != null) block.innerHTML += `<div class="informationBlockMessageDetail">${detail}</div>`;

    $(block).hide().appendTo(document.getElementById('informationBlock'));

    $(block).slideDown(250, () =>
    {
      setTimeout(() => { $(block).slideUp(250, () =>{ block.remove(); }); }, 5000);
    });
  }
}

/****************************************************************************************************/

function displaySuccess(title, message, detail, messageTag)
{
  if(document.getElementById('informationBlock'))
  {
    checkMessageTag(messageTag);
    
    var block = document.createElement('div');

    block.setAttribute('class', 'informationBlockMessage');

    if(messageTag != null && messageTag != undefined) block.setAttribute('tag', messageTag);

    block.innerHTML += `<div class="informationBlockMessageTitleSuccess"><div class="informationBlockMessageTitleIcon"><i class="fas fa-check-circle"></i></div><div class="informationBlockMessageTitleText">${title}</div></div>`;
    block.innerHTML += `<div class="informationBlockMessageContent">${message}</div>`;

    if(detail != null) block.innerHTML += `<div class="informationBlockMessageDetail">${detail}</div>`;

    $(block).hide().appendTo(document.getElementById('informationBlock'));

    $(block).slideDown(250, () =>
    {
      setTimeout(() => { $(block).slideUp(250, () =>{ block.remove(); }); }, 5000);
    });
  }
}

/****************************************************************************************************/

function displayLoader(title, message, detail, callback)
{
  if(document.getElementById('informationBlock'))
  {
    var block = document.createElement('div');

    block.setAttribute('class', 'informationBlockMessage');

    block.innerHTML += `<div class="informationBlockMessageTitleInfo"><div class="informationBlockMessageTitleIcon"><i class="fas fa-cog fa-spin"></i></div><div class="informationBlockMessageTitleText">${title}</div></div>`;
    block.innerHTML += `<div class="informationBlockMessageContent">${message}</div>`;

    if(detail != null) block.innerHTML += `<div class="informationBlockMessageDetail">${detail}</div>`;

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