/****************************************************************************************************/

if(document.getElementById('account-list'))
{
  var accounts = document.getElementById('account-list').children;

  var x = 0;

  var addListenner = () =>
  {
    accounts[x].addEventListener('click', openAccountDetail);

    if(accounts[x += 1] != undefined) addListenner();
  }

  if(accounts[x] != undefined) addListenner();
}

/****************************************************************************************************/

function openAccountDetail(event)
{
  var x = 0;
  var account = event.target;

  var getParentLoop = () =>
  {
    account = account.parentNode;

    if(account.hasAttribute('name') == false) getParentLoop();
  }

  if(account.hasAttribute('name') == false) getParentLoop();

  location = '/admin/accounts/' + account.getAttribute('name');
}

/****************************************************************************************************/

if(document.getElementById('modify-account-email-pencil')) document.getElementById('modify-account-email-pencil').addEventListener('click', modifyEmail);
if(document.getElementById('modify-account-lastname-pencil')) document.getElementById('modify-account-lastname-pencil').addEventListener('click', modifyLastname);
if(document.getElementById('modify-account-firstname-pencil')) document.getElementById('modify-account-firstname-pencil').addEventListener('click', modifyFirstname);

if(document.getElementById('modify-account-suspended-lock')) document.getElementById('modify-account-suspended-lock').addEventListener('click', suspendAccount);

/****************************************************************************************************/

function modifyEmail()
{
  if(document.getElementById('modify-account-lastname').getAttribute('tag') == 'on' || document.getElementById('modify-account-firstname').getAttribute('tag') == 'on')
  {
    if(document.getElementById('modify-account-warning')) document.getElementById('modify-account-warning').remove();

    var message         = document.createElement('div');

    message             .setAttribute('id', 'modify-account-warning');
    message             .setAttribute('class', 'warning');
    message             .innerText = `Vous ne pouvez modifier qu'une valeur à la fois`;

    document.getElementById('modify-account').appendChild(message);

    setTimeout(() =>
    {
      message.remove();
    }, 3000);
  }

  else
  {
    document.getElementById('modify-account-email').setAttribute('tag', 'on');
    document.getElementById('modify-account-email-pencil').style.display = 'none';

    var send        = document.createElement('div');
    var undo        = document.createElement('div');
    var input       = document.createElement('input');

    undo            .innerHTML = `<i class='fas fa-undo'></i>`;
    undo            .setAttribute('class', 'undo');
    undo            .setAttribute('id', 'modify-account-email-undo');
    undo            .addEventListener('click', cancelEmailEditing);
    send            .innerHTML = `<i class='far fa-paper-plane'></i>`;
    send            .setAttribute('class', 'icon');
    send            .setAttribute('id', 'modify-account-email-send');
    send            .addEventListener('click', sendEmail);
    input           .setAttribute('type', 'text');
    input           .setAttribute('class', 'input');
    input           .setAttribute('id', 'modify-account-email-input');
    input           .value = document.getElementById('modify-account-email-value').innerText;

    document.getElementById('modify-account-email-value').style.display = 'none';
    document.getElementById('modify-account-email').insertBefore(input, document.getElementById('modify-account-email-value'));
    document.getElementById('modify-account-email').insertBefore(undo, input);
    document.getElementById('modify-account-email').appendChild(send);
  }
}

/****************************************************************************************************/

function modifyLastname()
{
  if(document.getElementById('modify-account-email').getAttribute('tag') == 'on' || document.getElementById('modify-account-firstname').getAttribute('tag') == 'on')
  {
    if(document.getElementById('modify-account-warning')) document.getElementById('modify-account-warning').remove();

    var message         = document.createElement('div');

    message             .setAttribute('id', 'modify-account-warning');
    message             .setAttribute('class', 'warning');
    message             .innerText = `Vous ne pouvez modifier qu'une valeur à la fois`;

    document.getElementById('modify-account').appendChild(message);

    setTimeout(() =>
    {
      message.remove();
    }, 3000);
  }

  else
  {
    document.getElementById('modify-account-lastname').setAttribute('tag', 'on');
    document.getElementById('modify-account-lastname-pencil').style.display = 'none';

    var send        = document.createElement('div');
    var undo        = document.createElement('div');
    var input       = document.createElement('input');

    undo            .innerHTML = `<i class='fas fa-undo'></i>`;
    undo            .setAttribute('class', 'undo');
    undo            .setAttribute('id', 'modify-account-lastname-undo');
    undo            .addEventListener('click', cancelLastnameEditing);
    send            .innerHTML = `<i class='far fa-paper-plane'></i>`;
    send            .setAttribute('class', 'icon');
    send            .setAttribute('id', 'modify-account-lastname-send');
    send            .addEventListener('click', sendLastname);
    input           .setAttribute('type', 'text');
    input           .setAttribute('class', 'input');
    input           .setAttribute('id', 'modify-account-lastname-input');
    input           .value = document.getElementById('modify-account-lastname-value').innerText;

    document.getElementById('modify-account-lastname-value').style.display = 'none';
    document.getElementById('modify-account-lastname').insertBefore(input, document.getElementById('modify-account-lastname-value'));
    document.getElementById('modify-account-lastname').insertBefore(undo, input);
    document.getElementById('modify-account-lastname').appendChild(send);
  }
}

/****************************************************************************************************/

function modifyFirstname()
{
  if(document.getElementById('modify-account-email').getAttribute('tag') == 'on' || document.getElementById('modify-account-lastname').getAttribute('tag') == 'on')
  {
    if(document.getElementById('modify-account-warning')) document.getElementById('modify-account-warning').remove();

    var message         = document.createElement('div');

    message             .setAttribute('id', 'modify-account-warning');
    message             .setAttribute('class', 'warning');
    message             .innerText = `Vous ne pouvez modifier qu'une valeur à la fois`;

    document.getElementById('modify-account').appendChild(message);

    setTimeout(() =>
    {
      message.remove();
    }, 3000);
  }

  else
  {
    document.getElementById('modify-account-firstname').setAttribute('tag', 'on');
    document.getElementById('modify-account-firstname-pencil').style.display = 'none';

    var send        = document.createElement('div');
    var undo        = document.createElement('div');
    var input       = document.createElement('input');

    undo            .innerHTML = `<i class='fas fa-undo'></i>`;
    undo            .setAttribute('class', 'undo');
    undo            .setAttribute('id', 'modify-account-firstname-undo');
    undo            .addEventListener('click', cancelFirstnameEditing);
    send            .innerHTML = `<i class='far fa-paper-plane'></i>`;
    send            .setAttribute('class', 'icon');
    send            .setAttribute('id', 'modify-account-firstname-send');
    send            .addEventListener('click', sendFirstname);
    input           .setAttribute('type', 'text');
    input           .setAttribute('class', 'input');
    input           .setAttribute('id', 'modify-account-firstname-input');
    input           .value = document.getElementById('modify-account-firstname-value').innerText;

    document.getElementById('modify-account-firstname-value').style.display = 'none';
    document.getElementById('modify-account-firstname').insertBefore(input, document.getElementById('modify-account-firstname-value'));
    document.getElementById('modify-account-firstname').insertBefore(undo, input);
    document.getElementById('modify-account-firstname').appendChild(send);
  }
}

/****************************************************************************************************/

function cancelEmailEditing()
{
  document.getElementById('modify-account-email').setAttribute('tag', 'off');

  document.getElementById('modify-account-email-undo').remove();
  document.getElementById('modify-account-email-send').remove();
  document.getElementById('modify-account-email-input').remove();
  document.getElementById('modify-account-email-value').removeAttribute('style');
  document.getElementById('modify-account-email-pencil').removeAttribute('style');
}

/****************************************************************************************************/

function cancelLastnameEditing()
{
  document.getElementById('modify-account-lastname').setAttribute('tag', 'off');

  document.getElementById('modify-account-lastname-undo').remove();
  document.getElementById('modify-account-lastname-send').remove();
  document.getElementById('modify-account-lastname-input').remove();
  document.getElementById('modify-account-lastname-value').removeAttribute('style');
  document.getElementById('modify-account-lastname-pencil').removeAttribute('style');
}

/****************************************************************************************************/

function cancelFirstnameEditing()
{
  document.getElementById('modify-account-firstname').setAttribute('tag', 'off');

  document.getElementById('modify-account-firstname-undo').remove();
  document.getElementById('modify-account-firstname-send').remove();
  document.getElementById('modify-account-firstname-input').remove();
  document.getElementById('modify-account-firstname-value').removeAttribute('style');
  document.getElementById('modify-account-firstname-pencil').removeAttribute('style');
}

/****************************************************************************************************/

function sendEmail()
{
  document.getElementById('modify-account-email-input').removeAttribute('style');

  if(document.getElementById('modify-account-email-input').value.length == 0)
  {
    if(document.getElementById('modify-account-warning')) document.getElementById('modify-account-warning').remove();

    var message         = document.createElement('div');

    message             .setAttribute('id', 'modify-account-warning');
    message             .setAttribute('class', 'warning');
    message             .innerText = `Veuillez compléter le champ`;

    document.getElementById('modify-account').appendChild(message);

    document.getElementById('modify-account-email-input').style.borderBottom = '1px solid #D9534F';

    setTimeout(() =>
    {
      message.remove();
    }, 3000);
  }

  else
  {
    document.getElementById('modify-account-detail').style.filter = 'blur(4px)';
    document.getElementById('modify-account-background').style.display = 'block';

    var xhr   = new XMLHttpRequest();
    var data  = new FormData();

    data.append('email', document.getElementById('modify-account-email-input').value);
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

    xhr.open('POST', '/queries/admin/accounts/modify', true);

    xhr.send(data);

    xhr.onreadystatechange = () =>
    {
      if(xhr.readyState == xhr.DONE)
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
          var success         = document.createElement('div');

          success             .setAttribute('id', 'modify-account-warning');
          success             .setAttribute('class', 'success');
          success             .innerText = xhr.response.message;

          document.getElementById('modify-account').appendChild(success);

          document.getElementById('modify-account-email').setAttribute('tag', 'off');

          document.getElementById('modify-account-email-value').innerText = document.getElementById('modify-account-email-input').value;

          document.getElementById('modify-account-email-undo').remove();
          document.getElementById('modify-account-email-send').remove();
          document.getElementById('modify-account-email-input').remove();
          document.getElementById('modify-account-email-value').removeAttribute('style');
          document.getElementById('modify-account-email-pencil').removeAttribute('style');

          socket.emit('accountModified', document.getElementById('modify-account').getAttribute('name'));

          setTimeout(() =>
          {
            success.remove();
          }, 3000);
        }
      }
    }
  }
}

/****************************************************************************************************/

function sendLastname()
{
  document.getElementById('modify-account-lastname-input').removeAttribute('style');

  if(document.getElementById('modify-account-lastname-input').value.length == 0)
  {
    if(document.getElementById('modify-account-warning')) document.getElementById('modify-account-warning').remove();

    var message         = document.createElement('div');

    message             .setAttribute('id', 'modify-account-warning');
    message             .setAttribute('class', 'warning');
    message             .innerText = `Veuillez compléter le champ`;

    document.getElementById('modify-account').appendChild(message);

    document.getElementById('modify-account-lastname-input').style.borderBottom = '1px solid #D9534F';

    setTimeout(() =>
    {
      message.remove();
    }, 3000);
  }

  else
  {
    document.getElementById('modify-account-detail').style.filter = 'blur(4px)';
    document.getElementById('modify-account-background').style.display = 'block';

    var xhr   = new XMLHttpRequest();
    var data  = new FormData();

    data.append('lastname', document.getElementById('modify-account-lastname-input').value);
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

    xhr.open('POST', '/queries/admin/accounts/modify', true);

    xhr.send(data);

    xhr.onreadystatechange = () =>
    {
      if(xhr.readyState == xhr.DONE)
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
          var success         = document.createElement('div');

          success             .setAttribute('id', 'modify-account-warning');
          success             .setAttribute('class', 'success');
          success             .innerText = xhr.response.message;

          document.getElementById('modify-account').appendChild(success);

          document.getElementById('modify-account-lastname').setAttribute('tag', 'off');

          document.getElementById('modify-account-lastname-value').innerText = `${document.getElementById('modify-account-lastname-input').value.toUpperCase()}`;

          document.getElementById('modify-account-lastname-undo').remove();
          document.getElementById('modify-account-lastname-send').remove();
          document.getElementById('modify-account-lastname-input').remove();
          document.getElementById('modify-account-lastname-value').removeAttribute('style');
          document.getElementById('modify-account-lastname-pencil').removeAttribute('style');

          socket.emit('accountModified', document.getElementById('modify-account').getAttribute('name'));

          setTimeout(() =>
          {
            success.remove();
          }, 3000);
        }
      }
    }
  }
}

/****************************************************************************************************/

function sendFirstname()
{
  document.getElementById('modify-account-firstname-input').removeAttribute('style');

  if(document.getElementById('modify-account-firstname-input').value.length == 0)
  {
    if(document.getElementById('modify-account-warning')) document.getElementById('modify-account-warning').remove();

    var message         = document.createElement('div');

    message             .setAttribute('id', 'modify-account-warning');
    message             .setAttribute('class', 'warning');
    message             .innerText = `Veuillez compléter le champ`;

    document.getElementById('modify-account').appendChild(message);

    document.getElementById('modify-account-firstname-input').style.borderBottom = '1px solid #D9534F';

    setTimeout(() =>
    {
      message.remove();
    }, 3000);
  }

  else
  {
    document.getElementById('modify-account-detail').style.filter = 'blur(4px)';
    document.getElementById('modify-account-background').style.display = 'block';

    var xhr   = new XMLHttpRequest();
    var data  = new FormData();

    data.append('firstname', document.getElementById('modify-account-firstname-input').value);
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

    xhr.open('POST', '/queries/admin/accounts/modify', true);

    xhr.send(data);

    xhr.onreadystatechange = () =>
    {
      if(xhr.readyState == xhr.DONE)
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
          var success         = document.createElement('div');

          success             .setAttribute('id', 'modify-account-warning');
          success             .setAttribute('class', 'success');
          success             .innerText = xhr.response.message;

          document.getElementById('modify-account').appendChild(success);

          document.getElementById('modify-account-firstname').setAttribute('tag', 'off');

          document.getElementById('modify-account-firstname-value').innerText = `${document.getElementById('modify-account-firstname-input').value.charAt(0).toUpperCase()}${document.getElementById('modify-account-firstname-input').value.slice(1).toLowerCase()}`;

          document.getElementById('modify-account-firstname-undo').remove();
          document.getElementById('modify-account-firstname-send').remove();
          document.getElementById('modify-account-firstname-input').remove();
          document.getElementById('modify-account-firstname-value').removeAttribute('style');
          document.getElementById('modify-account-firstname-pencil').removeAttribute('style');

          socket.emit('accountModified', document.getElementById('modify-account').getAttribute('name'));

          setTimeout(() =>
          {
            success.remove();
          }, 3000);
        }
      }
    }
  }
}

/****************************************************************************************************/

function suspendAccount(event)
{
  var background      = document.createElement('div');
  var box             = document.createElement('div');
  var message         = document.createElement('div');
  var yes             = document.createElement('div');
  var no              = document.createElement('div');

  background          .setAttribute('id', 'modify-account-suspended-background');

  background          .setAttribute('class', 'background');
  box                 .setAttribute('class', 'box');
  message             .setAttribute('class', 'message');
  yes                 .setAttribute('class', 'yes');
  no                  .setAttribute('class', 'no');

  yes                 .innerHTML = `<i class='fas fa-check-circle'></i>`;
  no                  .innerHTML = `<i class='fas fa-times-circle'></i>`;

  //Account is suspended
  if(document.getElementById('modify-account-suspended-lock').getAttribute('tag') == 'off')
  {
    background        .setAttribute('tag', 'false');
    message           .innerText = 'Êtes-vous sûr(e) de vouloir réhabiliter ce compte ?';
  }

  //Account is not suspended
  else
  {
    background        .setAttribute('tag', 'true');
    message           .innerText = 'Êtes-vous sûr(e) de vouloir suspendre ce compte ?';
  }

  yes                 .addEventListener('click', sendSuspendStatusToServer);
  no                  .addEventListener('click', closeSuspendConfirmationPopup);

  box                 .appendChild(message);
  box                 .appendChild(yes);
  box                 .appendChild(no);

  background          .appendChild(box);

  document.getElementById('modify-account-detail').style.filter = 'blur(4px)';

  document.getElementById('modify-account').appendChild(background);

  background          .style.display = 'block';
}

/****************************************************************************************************/

function closeSuspendConfirmationPopup()
{
  document.getElementById('modify-account-detail').removeAttribute('style');
  document.getElementById('modify-account-suspended-background').remove();
}

/****************************************************************************************************/

function sendSuspendStatusToServer(event)
{
  var status = document.getElementById('modify-account-suspended-background').getAttribute('tag') == 'true' ? true : false;

  document.getElementById('modify-account-suspended-background').remove();

  document.getElementById('modify-account-background').style.display = 'block';

  var xhr   = new XMLHttpRequest();
  var data  = new FormData();

  data.append('suspended', status);
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

  xhr.open('POST', '/queries/admin/accounts/modify', true);

  xhr.send(data);

  xhr.onreadystatechange = () =>
  {
    if(xhr.readyState == xhr.DONE)
    {
      document.getElementById('modify-account-detail').removeAttribute('style');
      document.getElementById('modify-account-background').removeAttribute('style');

      if(xhr.status == 500 || xhr.status == 404 || xhr.status == 406 || xhr.status == 401 || xhr.status == 403)
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
        var success         = document.createElement('div');

        success             .setAttribute('id', 'modify-account-warning');
        success             .setAttribute('class', 'success');
        success             .innerText = xhr.response.message;

        document.getElementById('modify-account').appendChild(success);

        if(document.getElementById('modify-account-suspended-lock').getAttribute('tag') == 'off')
        {
          document.getElementById('modify-account-suspended').children[0].innerText = 'Non';
          document.getElementById('modify-account-suspended').children[0].setAttribute('class', 'content false');
          document.getElementById('modify-account-suspended-lock').setAttribute('class', 'icon close');
          document.getElementById('modify-account-suspended-lock').setAttribute('tag', 'on');
          document.getElementById('modify-account-suspended-lock').innerHTML = `<i class='fas fa-lock'></i>`;
        }

        else
        {
          document.getElementById('modify-account-suspended').children[0].innerText = 'Oui';
          document.getElementById('modify-account-suspended').children[0].setAttribute('class', 'content true');
          document.getElementById('modify-account-suspended-lock').setAttribute('class', 'icon open');
          document.getElementById('modify-account-suspended-lock').setAttribute('tag', 'off');
          document.getElementById('modify-account-suspended-lock').innerHTML = `<i class='fas fa-lock-open'></i>`;
        }

        socket.emit('accountModified', document.getElementById('modify-account').getAttribute('name'));

        setTimeout(() =>
        {
          success.remove();
        }, 3000);
      }
    }
  }
}

/****************************************************************************************************/