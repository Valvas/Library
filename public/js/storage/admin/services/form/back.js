/****************************************************************************************************/

if(document.getElementById('form-back-to-extension-block')) document.getElementById('form-back-to-extension-block').addEventListener('click', backToFormExtensionBlock);
if(document.getElementById('form-extensions-block-back')) document.getElementById('form-extensions-block-back').addEventListener('click', backToInformationsBlock);

/****************************************************************************************************/

function backToInformationsBlock(event)
{
  document.getElementById('form-extensions-block').removeAttribute('style');
  document.getElementById('form-first-block').style.display = 'block';
}

/****************************************************************************************************/

function backToFormExtensionBlock(event)
{
  document.getElementById('form-second-block').style.display = 'none';
  document.getElementById('form-extensions-block').style.display = 'block';
  document.getElementById('background').remove();
}

/****************************************************************************************************/

function closeMembersList(event)
{
  if(document.getElementById('background').getAttribute('tag') == 'on')
  {
    document.getElementById('blur').removeAttribute('style');
    document.getElementById('background').removeAttribute('style');
    document.getElementById('background').setAttribute('tag', 'off');
  }
}

/****************************************************************************************************/