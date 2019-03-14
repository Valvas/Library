/****************************************************************************************************/

setInterval(() =>
{
  const cookies = document.cookie.split(';');

  cookies.forEach((element) =>
  {
    const correctedElement = element.trim();

    if(correctedElement.split('=')[0] === 'peiauth')
    {
      document.cookie = 'peiauth=xxxx;max-age=0;path=/';
      document.cookie = `peiauth=${correctedElement.split('=')[1]};max-age=${(60 * 60 * 24)};path=/`;
    }
  });
}, 6000);

/****************************************************************************************************/
