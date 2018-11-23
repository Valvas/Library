/****************************************************************************************************/

if(document.getElementById('filtersList'))
{
  const filters = document.getElementById('filtersList').children;

  for(var x = 0; x < filters.length; x++)
  {
    filters[x].children[1].addEventListener('change', applyFilter);
  }
}

/****************************************************************************************************/

var filters = document.getElementsByName('filter');

for(var i = 0; i < filters.length; i++)
{
  filters[i].addEventListener('change', applyFilter);
}

/****************************************************************************************************/

function applyFilter(event)
{
  if(document.getElementById('currentFolder') == null) return;

  const currentFiles = document.getElementById('currentFolder').children;

  for(var x = 0; x < currentFiles.length; x++)
  {
    var index = 1;

    if(currentFiles[x].children.length > 2) index += 1;

    if(currentFiles[x].children[index].innerText.split('.').length === 2)
    {
      if(currentFiles[x].children[index].innerText.split('.')[1] === event.target.value)
      {
        event.target.checked
        ? currentFiles[x].removeAttribute('style')
        : currentFiles[x].style.display = 'none';
      }
    }
  }
}

/****************************************************************************************************/