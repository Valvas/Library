/****************************************************************************************************/

function createBackground(backgroundIdentifier)
{
  var background = document.createElement('div');

  if(backgroundIdentifier != null && backgroundIdentifier != undefined && backgroundIdentifier.length > 0)
  {
    background.setAttribute('id', backgroundIdentifier);
  }

  background.setAttribute('class', 'commonBackground');

  document.body.appendChild(background);
}

/****************************************************************************************************/

function removeBackground(backgroundIdentifier)
{
  if(document.getElementById(backgroundIdentifier)) document.getElementById(backgroundIdentifier).remove();
}

/****************************************************************************************************/