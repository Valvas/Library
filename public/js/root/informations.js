/****************************************************************************************************/

function displayInfo(title, message, detail)
{
  if(document.getElementById('informationBlock'))
  {
    var block = document.createElement('div');

    block.setAttribute('class', 'informationBlockMessage');

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

function displayError(title, message, detail)
{
  if(document.getElementById('informationBlock'))
  {
    var block = document.createElement('div');

    block.setAttribute('class', 'informationBlockMessage');

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

function displaySuccess(title, message, detail)
{
  if(document.getElementById('informationBlock'))
  {
    var block = document.createElement('div');

    block.setAttribute('class', 'informationBlockMessage');

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