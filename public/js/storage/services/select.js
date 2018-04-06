/****************************************************************************************************/

if(document.getElementById('selectAll')) document.getElementById('selectAll').addEventListener('click', selectAll);
if(document.getElementById('unselectAll')) document.getElementById('unselectAll').addEventListener('click', unselectAll);

/****************************************************************************************************/

function selectFile(target)
{
  var checked = target.checked;

  var getParentLoop = () =>
  {
    target = target.parentElement;

    if(target.hasAttribute('tag') == false) getParentLoop();
  }

  if(target.hasAttribute('tag') == false) getParentLoop();

  var selectedFilesLabelAndCounter = document.getElementById('actions').children[0].innerText.split(':');

  checked ?

  document.getElementById('actions').children[0].innerText = `${selectedFilesLabelAndCounter[0]} : ${parseInt(selectedFilesLabelAndCounter[1]) + 1}`:
  document.getElementById('actions').children[0].innerText = `${selectedFilesLabelAndCounter[0]} : ${parseInt(selectedFilesLabelAndCounter[1]) - 1}`;
}

/****************************************************************************************************/

function selectAll(event)
{
  var files = document.getElementById('filesBlock').children;

  var x = 0;

  var loop = () =>
  {
    if(files[x].children[0].getAttribute('class') == 'checkbox')
    {
      if(files[x].children[0].children[0].checked == false)
      {
        files[x].children[0].children[0].checked = true;

        var selectedFilesLabelAndCounter = document.getElementById('actions').children[0].innerText.split(':');

        document.getElementById('actions').children[0].innerText = `${selectedFilesLabelAndCounter[0]} : ${parseInt(selectedFilesLabelAndCounter[1]) + 1}`;
      }
    }

    if(files[x += 1] != undefined) loop();
  }

  if(files[x] != undefined) loop();
}

/****************************************************************************************************/

function unselectAll(event)
{
  var files = document.getElementsByClassName('file');

  var x = 0;

  var loop = () =>
  {
    if(files[x].children[0].getAttribute('class') == 'checkbox')
    {
      if(files[x].children[0].children[0].checked == true)
      {
        files[x].children[0].children[0].checked = false;

        var selectedFilesLabelAndCounter = document.getElementById('actions').children[0].innerText.split(':');

        document.getElementById('actions').children[0].innerText = `${selectedFilesLabelAndCounter[0]} : ${parseInt(selectedFilesLabelAndCounter[1]) - 1}`;
      }
    }
    
    if(files[x += 1] != undefined) loop();
  }

  if(files[x] != undefined) loop();
}

/****************************************************************************************************/