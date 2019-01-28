/****************************************************************************************************/

socket.on('statusChanged', (accountUuid, currentStatus) =>
{
  if(document.getElementById('messengerStatus') == null) return;

  document.getElementById('messengerStatus').style.backgroundColor = '#469A1F';
});

/****************************************************************************************************/