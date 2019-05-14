/****************************************************************************************************/

setInterval(() =>
{
  const cookies = document.cookie.split(';');

  cookies.forEach((element) =>
  {
    const correctedElement = element.trim();

    if(correctedElement.split('=')[0] === 'peiauth')
    {
      $.ajax(
      {
        method: 'GET', timeout: 5000, dataType: 'JSON', url: '/refresh-token',

        error: (xhr, status, error) =>
        {
          xhr.responseJSON !== undefined
          ? console.error(new Error(xhr.responseJSON.message))
          : console.error(new Error('Could not refresh authentication token'));
        }

      }).done((result) =>
      {
        document.cookie = 'peiauth=xxxx;max-age=0;path=/';

        document.cookie = `peiauth=${result.token};max-age=${result.maxAge};path=/`;
      });
    }
  });
}, 600000);

/****************************************************************************************************/
