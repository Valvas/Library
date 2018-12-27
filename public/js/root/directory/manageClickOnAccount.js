/****************************************************************************************************/

if(document.getElementById('accountsList'))
{
  const accounts = document.getElementById('accountsList').children;

  for(var x = 0; x < accounts.length; x++)
  {
    const currentAccountUuid = accounts[x].getAttribute('name');

    accounts[x].addEventListener('click', () =>
    {
      location = `/directory/${currentAccountUuid}`;
    });
  }
}

/****************************************************************************************************/