/****************************************************************************************************/

var socket = io();

/****************************************************************************************************/

socket.on('connect', () =>
{
  socket.emit('storageAppAdminServicesList');
});

/****************************************************************************************************/

socket.on('serviceRemoved', (error, serviceName) =>
{
  var serviceBlocks = document.getElementsByClassName('serviceBlock');

  var x = 0;

  var browseBlocks = () =>
  {
    if(serviceBlocks[x].getAttribute('name') == serviceName)
    {
      $(serviceBlocks[x]).fadeOut(1000, () =>
      {
        serviceBlocks[x].remove();
      });
    }

    else
    {
      if(serviceBlocks[x += 1] != undefined) browseBlocks();
    }
  }

  if(serviceBlocks[x] != undefined) browseBlocks();
});

/****************************************************************************************************/