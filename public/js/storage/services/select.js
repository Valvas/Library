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
      document.getElementById('unselectAllFiles').setAttribute('class', 'storageServiceMainBlockToolsSelectionActionsButtonEnabled');
      document.getElementById('unselectAllFiles').addEventListener('click', unselectAllFiles);
    }

    if(document.getElementById('downloadSelection')) document.getElementById('downloadSelection').setAttribute('class', 'storageServiceMainBlockToolsSelectionActionsButtonEnabled');
    if(document.getElementById('removeSelection')) document.getElementById('removeSelection').setAttribute('class', 'storageServiceMainBlockToolsSelectionActionsButtonEnabled');

    return;
  }

  if(document.getElementById('downloadSelection')) document.getElementById('downloadSelection').removeEventListener('click', downloadSelection);
  if(document.getElementById('removeSelection')) document.getElementById('removeSelection').removeEventListener('click', removeSelection);

  if(document.getElementById('unselectAllFiles'))
  {
    document.getElementById('unselectAllFiles').setAttribute('class', 'storageServiceMainBlockToolsSelectionActionsButtonDisabled');
    document.getElementById('unselectAllFiles').removeEventListener('click', unselectAllFiles);
  }

  if(document.getElementById('downloadSelection')) document.getElementById('downloadSelection').setAttribute('class', 'storageServiceMainBlockToolsSelectionActionsButtonDisabled');
  if(document.getElementById('removeSelection')) document.getElementById('removeSelection').setAttribute('class', 'storageServiceMainBlockToolsSelectionActionsButtonDisabled');
}

/****************************************************************************************************/

function unselectAllFiles(event)
{
  if(document.getElementById('currentFolder') == null) return;

  const elements = document.getElementById('currentFolder').children;

  for(var x = 0; x < elements.length; x++)
  {
    if(elements[x].children[0].tagName === 'INPUT') elements[x].children[0].checked = false;
  }

  document.getElementById('selectedFilesAmount').innerText = '0';

  if(document.getElementById('downloadSelection')) document.getElementById('downloadSelection').removeEventListener('click', downloadSelection);
  if(document.getElementById('removeSelection')) document.getElementById('removeSelection').removeEventListener('click', removeSelection);

  if(document.getElementById('unselectAllFiles'))
  {
    document.getElementById('unselectAllFiles').setAttribute('class', 'storageServiceMainBlockToolsSelectionActionsButtonDisabled');
    document.getElementById('unselectAllFiles').removeEventListener('click', unselectAllFiles);
  }

  if(document.getElementById('downloadSelection')) document.getElementById('downloadSelection').setAttribute('class', 'storageServiceMainBlockToolsSelectionActionsButtonDisabled');
  if(document.getElementById('removeSelection')) document.getElementById('removeSelection').setAttribute('class', 'storageServiceMainBlockToolsSelectionActionsButtonDisabled');
}

/****************************************************************************************************/
