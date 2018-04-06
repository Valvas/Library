var socket = io();

/****************************************************************************************************/

socket.on('connect', () =>
{
  socket.emit('adminAppAccountsHomeJoin');
  socket.emit('adminAppAccountsDetailJoin', document.getElementById('modify-account').getAttribute('name'));
});

/****************************************************************************************************/

socket.on('accountRemovedOnDetail', () =>
{
  if(document.getElementById('modify-account-detail')) document.getElementById('modify-account-detail').remove();

  var removed   = document.createElement('div');
  var message   = document.createElement('div');
  var icon      = document.createElement('div');
  var content   = document.createElement('div');
  var button    = document.createElement('button');

  icon          .innerHTML = `<i class='far fa-times-circle'></i>`;
  content       .innerText = 'Ce compte a été supprimé';
  button        .innerText = 'Retour';

  removed       .setAttribute('class', 'removed');
  message       .setAttribute('class', 'message');
  icon          .setAttribute('class', 'icon');
  content       .setAttribute('class', 'content');
  button        .setAttribute('class', 'button');

  button        .addEventListener('click', clickOnExitButton);

  message       .appendChild(icon);
  message       .appendChild(content);

  removed       .appendChild(message);
  removed       .appendChild(button);

  document.getElementById('modify-account').appendChild(removed);
});

/****************************************************************************************************/