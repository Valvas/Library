/****************************************************************************************************/

if(document.getElementById('selectAll')) document.getElementById('selectAll').addEventListener('click', selectAll);
if(document.getElementById('unselectAll')) document.getElementById('unselectAll').addEventListener('click', unselectAll);

/****************************************************************************************************/

function selectFile(target)
{
  var checked = target.checked;

  var selectedFilesLabelAndCounter = document.getElementById('actions').children[0].innerText.split(':');

  if(checked)
  {
    document.getElementById('actions').children[0].setAttribute('name', parseInt(document.getElementById('actions').children[0].getAttribute('name')) + 1);
    document.getElementById('actions').children[0].innerText = `${selectedFilesLabelAndCounter[0]} : ${parseInt(selectedFilesLabelAndCounter[1]) + 1}`;
  }

  else
  {
    document.getElementById('actions').children[0].setAttribute('name', parseInt(document.getElementById('actions').children[0].getAttribute('name')) - 1);
    document.getElementById('actions').children[0].innerText = `${selectedFilesLabelAndCounter[0]} : ${parseInt(selectedFilesLabelAndCounter[1]) - 1}`;
  }
}

/****************************************************************************************************/

function selectAll(event)
{
  var elements = document.getElementById('filesBlock').children;
  var selectedElements = 0;

  for(var x = 0; x < elements.length; x++)
  {
    if(elements[x].hasAttribute('tag'))
    {
      elements[x].children[2].checked = true;

      selectedElements += 1;
    }
  }

  var selectedFilesLabelAndCounter = document.getElementById('actions').children[0].innerText.split(':');

  document.getElementById('actions').children[0].innerText = `${selectedFilesLabelAndCounter[0]} : ${selectedElements}`;
}

/****************************************************************************************************/

function unselectAll(event)
{
  var elements = document.getElementById('filesBlock').children;

  for(var x = 0; x < elements.length; x++)
  {
    if(elements[x].hasAttribute('tag'))
    {
      elements[x].children[2].checked = false;
    }
  }

  var selectedFilesLabelAndCounter = document.getElementById('actions').children[0].innerText.split(':');

  document.getElementById('actions').children[0].innerText = `${selectedFilesLabelAndCounter[0]} : 0`;
}

/****************************************************************************************************/