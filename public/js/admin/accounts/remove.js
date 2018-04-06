/****************************************************************************************************/

if(document.getElementById('remove-account-button')) document.getElementById('remove-account-button').addEventListener('click', openConfirmationPrompt);

/****************************************************************************************************/

function openConfirmationPrompt(event)
{
  if(document.getElementById('remove-account-prompt') == null)
  {
    var background      = document.createElement('div');
    var box             = document.createElement('div');
    var message         = document.createElement('div');
    var yes             = document.createElement('div');
    var no              = document.createElement('div');

    background          .setAttribute('id', 'remove-account-prompt');

    background          .setAttribute('class', 'background');
    box                 .setAttribute('class', 'box');
    message             .setAttribute('class', 'message');
    yes                 .setAttribute('class', 'yes');
    no                  .setAttribute('class', 'no');

    yes                 .innerHTML = `<i class='fas fa-check-circle'></i>`;
    no                  .innerHTML = `<i class='fas fa-times-circle'></i>`;

    message             .innerText = `Êtes-vous sûr(e) de vouloir supprimer ce compte ? (Aucune récupération n'est possible)`;

    yes                 .addEventListener('click', sendRemovalOrderToServer);
    no                  .addEventListener('click', closeRemovePrompt);

    box                 .appendChild(message);
    box                 .appendChild(yes);
    box                 .appendChild(no);

    background          .appendChild(box);

    document.getElementById('modify-account-detail').style.filter = 'blur(4px)';

    document.getElementById('modify-account').appendChild(background);

    background          .style.display = 'block';
  }
}

/****************************************************************************************************/

function closeRemovePrompt()
{
  document.getElementById('modify-account-detail').removeAttribute('style');
  document.getElementById('remove-account-prompt').remove();
}

/****************************************************************************************************/

function sendRemovalOrderToServer()
{
  document.getElementById('remove-account-prompt').remove();
  document.getElementById('modify-account-background').style.display = 'block';

  var xhr   = new XMLHttpRequest();
  var data  = new FormData();

  data.append('uuid', document.getElementById('modify-account').getAttribute('name'));

  xhr.responseType = 'json';

  xhr.timeout = 10000;

  xhr.ontimeout = () =>
  {
    document.getElementById('modify-account-detail').removeAttribute('style');
    document.getElementById('modify-account-background').removeAttribute('style');

    if(document.getElementById('modify-account-warning')) document.getElementById('modify-account-warning').remove();

    var error         = document.createElement('div');

    error             .setAttribute('id', 'modify-account-warning');
    error             .setAttribute('class', 'warning');
    error             .innerText = 'Le serveur a mis trop de temps à répondre';

    document.getElementById('modify-account').appendChild(error);

    setTimeout(() =>
    {
      error.remove();
    }, 3000);
  }

  xhr.onload = () =>
  {
    document.getElementById('modify-account-detail').removeAttribute('style');
    document.getElementById('modify-account-background').removeAttribute('style');

    if(xhr.status == 500 || xhr.status == 404 || xhr.status == 406)
    {
      if(document.getElementById('modify-account-warning')) document.getElementById('modify-account-warning').remove();

      var error         = document.createElement('div');

      error             .setAttribute('id', 'modify-account-warning');
      error             .setAttribute('class', 'warning');
      error             .innerText = xhr.response.message;

      document.getElementById('modify-account').appendChild(error);

      setTimeout(() =>
      {
        error.remove();
      }, 3000);
    }

    else
    {
      document.getElementById('modify-account-detail').remove();

      var removed   = document.createElement('div');
      var message   = document.createElement('div');
      var icon      = document.createElement('div');
      var content   = document.createElement('div');
      var button    = document.createElement('button');

      icon          .innerHTML = `<i class='far fa-check-circle'></i>`;
      content       .innerText = xhr.response.strings.admin.detail.removed;
      button        .innerText = xhr.response.strings.admin.detail.exit;

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

      socket.emit('accountRemoved', document.getElementById('modify-account').getAttribute('name'));
    }
  }

  xhr.open('POST', '/queries/admin/accounts/remove', true);

  xhr.send(data);
}

/****************************************************************************************************/

function clickOnExitButton(event)
{
  location = '/admin/accounts';
}

/****************************************************************************************************/