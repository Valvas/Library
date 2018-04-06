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
      if(event.target.checked == false)
      {
        files[i].style.display = 'none';

        if(files[i].children[0].getAttribute('class') == 'checkbox' && files[i].children[0].children[0].checked)
        {
          files[i].children[0].children[0].checked = false;

          var selectedFilesLabelAndCounter = document.getElementById('actions').children[0].innerText.split(':');

          document.getElementById('actions').children[0].innerText = `${selectedFilesLabelAndCounter[0]} : ${parseInt(selectedFilesLabelAndCounter[1]) - 1}`;
        }
      }
      
      else
      {
        files[i].removeAttribute('style');
      }
    }
  }
}

/****************************************************************************************************/