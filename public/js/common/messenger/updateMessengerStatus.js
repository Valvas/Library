'use strict'

/****************************************************************************************************/

function updateMessengerStatus(event)
{
  const selectedValue = event.target.options[event.target.selectedIndex].value;

  switch(selectedValue)
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
}

/****************************************************************************************************/

function updateMessengerStatusCookie(status)
{
  document.cookie = 'intranetPeiMessengerStatus=xxxx;Max-Age=0;path=/';
  document.cookie = `intranetPeiMessengerStatus=${status};Max-Age=${60 * 60 * 24 * 365 * 10};path=/`;
}

/****************************************************************************************************/

function getMessengerStatusFromCookie()
{
  const cookies = document.cookie.split(';');

  let currentStatus = 'available';

  cookies.forEach((element) =>
  {
    const correctedElement = element.trim();

    if(correctedElement.split('=')[0] === 'intranetPeiMessengerStatus')
    {
      currentStatus = correctedElement.split('=')[1];
    }
  });

  return currentStatus;
}

/****************************************************************************************************/
