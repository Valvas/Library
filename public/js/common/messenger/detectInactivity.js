/****************************************************************************************************/

function detectInactivity()
{
  const timeout = 120;

  let currentTimer = 0;

  document.addEventListener('mousemove', () =>
  {
    currentTimer = 0;

    switch(document.getElementById('messengerUpdateStatus').options[document.getElementById('messengerUpdateStatus').selectedIndex].value)
    {
      case 'available':
        socket.emit('messengerSetStatusToAvailable');
        updateMessengerStatusCookie('available');
        break;

      case 'busy':
        socket.emit('messengerSetStatusToBusy');
        updateMessengerStatusCookie('busy');
        break;

      case 'away':
        socket.emit('messengerSetStatusToAway');
        updateMessengerStatusCookie('away');
        break;
    }
  });

  document.addEventListener('keydown', () =>
  {
    currentTimer = 0;

    switch(document.getElementById('messengerUpdateStatus').options[document.getElementById('messengerUpdateStatus').selectedIndex].value)
    {
      case 'available':
        socket.emit('messengerSetStatusToAvailable');
        updateMessengerStatusCookie('available');
        break;

      case 'busy':
        socket.emit('messengerSetStatusToBusy');
        updateMessengerStatusCookie('busy');
        break;

      case 'away':
        socket.emit('messengerSetStatusToAway');
        updateMessengerStatusCookie('away');
        break;
    }
  });

  setInterval(() =>
  {
    currentTimer += 1;

    if(currentTimer >= timeout)
    {
      socket.emit('messengerSetStatusToAway');
    }

  }, 1000);
}

/****************************************************************************************************/
