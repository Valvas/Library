/****************************************************************************************************/

const accounts = document.getElementsByName('accountBlock');

for(var x = 0; x < accounts.length; x++)
{
  const currentAccountUuid = accounts[x].getAttribute('id');

  accounts[x].addEventListener('click', () => { sendToAccountAccessDetail(currentAccountUuid) });
}

/****************************************************************************************************/

function sendToAccountAccessDetail(currentAccountUuid)
{
  location = `/administration/access/${currentAccountUuid}`;
}

/****************************************************************************************************/