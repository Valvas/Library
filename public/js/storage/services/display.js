/****************************************************************************************************/

var displays = document.getElementById('display').children;

for(var i = 0; i < displays.length; i++)
{
  displays[i].addEventListener('click', changeDisplay);
}

/****************************************************************************************************/

function changeDisplay(event)
{
  var target = event.target;

  var getParentLoop = () =>
  {
    target = target.parentNode;

    if(target.hasAttribute('tag') == false) getParentLoop();
  }

  if(target.hasAttribute('tag') == false) getParentLoop();

  if(target.getAttribute('tag') == 'false')
  {
    var displays = document.getElementById('display').children;

    var x = 0;

    var setTagToFalse = () =>
    {
      displays[x].setAttribute('tag', 'false');
      displays[x].setAttribute('class', 'choice false');

      if(displays[x += 1] != undefined) setTagToFalse();
    }

    setTagToFalse();

    target.setAttribute('tag', 'true');
    target.setAttribute('class', 'choice true');

    switch(target.getAttribute('name'))
    {
      case 'list': setListDisplay(); break;
      case 'small': setSmallGridDisplay(); break;
      case 'large': setLargeGridDisplay(); break;
      default: setLargeGridDisplay(); break;
    }
  }
}

/****************************************************************************************************/

function setListDisplay()
{
  var files = document.getElementsByClassName('file');

  for(var i = 0; i < files.length; i++)
  {
    files[i].setAttribute('class', 'file list');
  }
}

/****************************************************************************************************/

function setSmallGridDisplay()
{
  var files = document.getElementsByClassName('file');

  for(var i = 0; i < files.length; i++)
  {
    files[i].setAttribute('class', 'file small');
  }
}

/****************************************************************************************************/

function setLargeGridDisplay()
{
  var files = document.getElementsByClassName('file');

  for(var i = 0; i < files.length; i++)
  {
    files[i].setAttribute('class', 'file large');
  }
}

/****************************************************************************************************/