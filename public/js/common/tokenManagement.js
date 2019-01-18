/****************************************************************************************************/

updateToken();

/****************************************************************************************************/

function updateToken()
{
  var cookies = document.cookie.split(';');

  cookies.forEach((element) =>
  {
    if(element.split('=')[0] === 'peiauth')
    {
      document.cookie = 'peiauth=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'peiauth=' + element.split('=')[1] + '; max-age=' + (60 * 60 * 24);
    }
  });
}

/****************************************************************************************************/