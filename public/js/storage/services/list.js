/****************************************************************************************************/

function selectService(serviceUuid)
{
  const serviceBlocks = document.getElementsByName('serviceBlock');

  for(var x = 0; x < serviceBlocks.length; x++)
  {
    serviceBlocks[x].removeAttribute('style');
  }

  document.getElementById(serviceUuid).style.backgroundColor = '#CBE1FF';
}

/****************************************************************************************************/

function openService(serviceUuid)
{
  location = `/storage/services/${serviceUuid}`;
}

/****************************************************************************************************/