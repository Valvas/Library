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