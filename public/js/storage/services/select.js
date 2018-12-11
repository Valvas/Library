/****************************************************************************************************/

function updateSelectedFiles(checkbox)
{
  if(document.getElementById('selectedFilesAmount') == null) return;

  checkbox.checked
  ? document.getElementById('selectedFilesAmount').innerText = parseInt(document.getElementById('selectedFilesAmount').innerText) + 1
  : document.getElementById('selectedFilesAmount').innerText = parseInt(document.getElementById('selectedFilesAmount').innerText) - 1;

  if(parseInt(document.getElementById('selectedFilesAmount').innerText) > 0)
  {
    if(document.getElementById('downloadSelection')) document.getElementById('downloadSelection').addEventListener('click', downloadSelection);
    if(document.getElementById('removeSelection')) document.getElementById('removeSelection').addEventListener('click', removeSelection);

    if(document.getElementById('unselectAllFiles'))
    {
      document.getElementById('unselectAllFiles').setAttribute('class', 'serviceUnselectFiles');
      document.getElementById('unselectAllFiles').addEventListener('click', unselectAllFiles);
    }

    if(document.getElementById('downloadSelection')) document.getElementById('downloadSelection').setAttribute('class', 'serviceDownloadFiles');
    if(document.getElementById('removeSelection')) document.getElementById('removeSelection').setAttribute('class', 'serviceRemoveFiles');

    return;
  }

  if(document.getElementById('downloadSelection')) document.getElementById('downloadSelection').removeEventListener('click', downloadSelection);
  if(document.getElementById('removeSelection')) document.getElementById('removeSelection').removeEventListener('click', removeSelection);

  if(document.getElementById('unselectAllFiles'))
  {
    document.getElementById('unselectAllFiles').setAttribute('class', 'serviceUnselectFilesDisabled');
    document.getElementById('unselectAllFiles').removeEventListener('click', unselectAllFiles);
  }

  if(document.getElementById('downloadSelection')) document.getElementById('downloadSelection').setAttribute('class', 'serviceDownloadFilesDisabled');
  if(document.getElementById('removeSelection')) document.getElementById('removeSelection').setAttribute('class', 'serviceRemoveFilesDisabled');
}

/****************************************************************************************************/

function unselectAllFiles(event)
{
  if(document.getElementById('filesContainer') == null) return;

  const elements = document.getElementById('filesContainer').children;

  for(var x = 0; x < elements.length; x++)
  {
    if(elements[x].children[0].tagName === 'INPUT') elements[x].children[0].checked = false;
  }

  document.getElementById('selectedFilesAmount').innerText = '0';

  if(document.getElementById('downloadSelection')) document.getElementById('downloadSelection').removeEventListener('click', downloadSelection);
  if(document.getElementById('removeSelection')) document.getElementById('removeSelection').removeEventListener('click', removeSelection);

  if(document.getElementById('unselectAllFiles'))
  {
    document.getElementById('unselectAllFiles').setAttribute('class', 'serviceUnselectFilesDisabled');
    document.getElementById('unselectAllFiles').removeEventListener('click', unselectAllFiles);
  }

  if(document.getElementById('downloadSelection')) document.getElementById('downloadSelection').setAttribute('class', 'serviceDownloadFilesDisabled');
  if(document.getElementById('removeSelection')) document.getElementById('removeSelection').setAttribute('class', 'serviceRemoveFilesDisabled');
}

/****************************************************************************************************/
