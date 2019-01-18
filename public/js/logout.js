/****************************************************************************************************/

if(document.getElementById('logoutButton')) document.getElementById('logoutButton').addEventListener('click', openLogoutConfirmationPopup);

/****************************************************************************************************/

function logout()
{
  document.cookie = 'peiauth=xxxx;max-age=0';

  location = '/';
}

/****************************************************************************************************/

function openLogoutConfirmationPopup()
{
  if(document.getElementById('logoutBackground')) return;

  createBackground('logoutBackground');

  var background  = document.createElement('div');
  var popup       = document.createElement('div');
  var buttons     = document.createElement('div');
  var confirm     = document.createElement('button');
  var cancel      = document.createElement('button');

  background      .setAttribute('class', 'logoutBackground');
  popup           .setAttribute('class', 'logoutPopup');
  buttons         .setAttribute('class', 'logoutPopupButtons');
  confirm         .setAttribute('class', 'logoutPopupConfirm');
  cancel          .setAttribute('class', 'logoutPopupCancel');

  popup           .innerHTML += `<div class="logoutPopupTitle">Déconnexion</div>`;
  popup           .innerHTML += `<div class="logoutPopupMessage">Êtes-vous sûr(e) de vouloir vous déconnecter ?</div>`;
  confirm         .innerText = 'Oui';
  cancel          .innerText = 'Non';

  confirm         .addEventListener('click', logout);

  cancel          .addEventListener('click', () =>
  {
    background.remove();
    removeBackground('logoutBackground');
  });

  buttons         .appendChild(confirm);
  buttons         .appendChild(cancel);
  popup           .appendChild(buttons);
  background      .appendChild(popup);

  document.body   .appendChild(background);
}

/****************************************************************************************************/