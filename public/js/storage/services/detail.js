/****************************************************************************************************/

applyDetailClickEventOnFiles();

/****************************************************************************************************/

function applyDetailClickEventOnFiles()
{
  var elements = document.getElementById('filesBlock').children;

  for(var x = 0; x < elements.length; x++)
  { 
    if(elements[x].hasAttribute('tag'))
    {
      elements[x].addEventListener('click', openFileDetail);
    }
  }
}

/****************************************************************************************************/

function openFileDetail(event)
{
  if(event.target.type !== 'checkbox')
  {
    console.log(true);
  }
}

/****************************************************************************************************/

function openFolderDetail(folderUuid)
{
  var elementDetailBlock        = document.createElement('div');
  var elementDetailBlockTitle   = document.createElement('div');
  var elementDetailBlockClose   = document.createElement('div');
  var elementDetailBlockSpinner = document.createElement('div');

  elementDetailBlock            .setAttribute('id', 'elementDetailBlock');
  elementDetailBlock            .setAttribute('name', folderUuid);
  
  elementDetailBlock            .setAttribute('class', 'elementDetailBlock');
  elementDetailBlockClose       .setAttribute('class', 'elementDetailBlockClose');
  elementDetailBlockTitle       .setAttribute('class', 'elementDetailBlockTitle');
  elementDetailBlockSpinner     .setAttribute('class', 'elementDetailBlockSpinner');

  elementDetailBlockSpinner     .innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
  elementDetailBlockClose       .innerHTML = '<i class="fas fa-arrow-right"></i>';

  elementDetailBlockClose       .addEventListener('click', closeDetailBlock);

  elementDetailBlock            .appendChild(elementDetailBlockClose);
  elementDetailBlock            .appendChild(elementDetailBlockSpinner);

  $(elementDetailBlock).hide().appendTo(document.getElementById('mainBlock'));

  $(elementDetailBlock).toggle('slide', { direction: 'right' }, 200);

  $.ajax(
  {
    method: 'PUT',
    dataType: 'json',
    data: { folderUuid: folderUuid, serviceUuid: document.getElementById('mainBlock').getAttribute('name') },
    timeout: 5000,
    url: '/queries/storage/services/get-folder-content',

    error: (xhr, textStatus, errorThrown) =>
    {
      closeDetailBlock();

      xhr.responseJSON != undefined
      ? displayErrorMessage(xhr.responseJSON.message, xhr.responseJSON.detail)
      : displayErrorMessage('Une erreur est survenue, veuillez réessayer plus tard', null);
    }

  }).done((json) =>
  {
    console.log(json);

    elementDetailBlockSpinner.remove();
  });
}

/****************************************************************************************************/

function closeDetailBlock()
{
  if(document.getElementById('elementDetailBlock'))
  {
    document.getElementById(document.getElementById('elementDetailBlock').getAttribute('name')).removeAttribute('style');

    $(document.getElementById('elementDetailBlock')).toggle('slide', { direction: 'right' }, 200, () => { if(document.getElementById('elementDetailBlock')) document.getElementById('elementDetailBlock').remove(); });
  }
}

/****************************************************************************************************/