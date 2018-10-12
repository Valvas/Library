/****************************************************************************************************/

if(document.getElementById('logoutButton')) document.getElementById('logoutButton').addEventListener('click', logout);

/****************************************************************************************************/

function logout(event)
{
  document.cookie = 'peiauth=xxxx;max-age=0';

  location = '/';
}

/****************************************************************************************************/