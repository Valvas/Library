/****************************************************************************************************/

var filters = document.getElementsByName('filter');

for(var i = 0; i < filters.length; i++)
{
  filters[i].addEventListener('change', applyFilter);
}

/****************************************************************************************************/

function applyFilter(event)
{
  var files = document.getElementsByClassName('file');

  for(var i = 0; i < files.length; i++)
  {
    if(files[i].getAttribute('tag') == event.target.getAttribute('value'))
    {
      event.target.checked == false ? files[i].style.display = 'none' : files[i].removeAttribute('style');
    }
  }
}

/****************************************************************************************************/