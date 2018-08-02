/****************************************************************************************************/

var socket = io();

/****************************************************************************************************/

socket.on('connect', () =>
{
  socket.emit('storageAppAdminServicesList');
});

/****************************************************************************************************/

socket.on('serviceRemoved', (serviceUuid) =>
{
  if(document.getElementById(serviceUuid))
  {
    $(document.getElementById(serviceUuid)).fadeOut(1000, () =>
    {
      document.getElementById(serviceUuid).remove();
    });
  }
});

/****************************************************************************************************/