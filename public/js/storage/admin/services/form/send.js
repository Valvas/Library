/****************************************************************************************************/

document.getElementById('form-second-block-send-form').addEventListener('click', submitForm);

/****************************************************************************************************/

function submitForm()
{
  var check = true;

  if(document.getElementById('form-input-identifier').value.match(/^[a-z]([a-z|0-9]){0,63}$/) == null)
  {
    check = false;
    document.getElementById('form-input-identifier-correct').removeAttribute('style');
    document.getElementById('form-input-identifier-incorrect').style.display = 'block';
  }

  if(document.getElementById('form-input-name').value.match(/^([A-Za-z](\s?[A-Za-z0-9])+)$/) == null)
  {
    check = false;
    document.getElementById('form-input-name-correct').removeAttribute('style');
    document.getElementById('form-input-name-incorrect').style.display = 'block';
  }

  if(document.getElementById('form-input-size').value.match(/^[0-9]{1,7}$/) == null)
  {
    check = false;
    document.getElementById('form-input-size-correct').removeAttribute('style');
    document.getElementById('form-input-size-incorrect').style.display = 'block';
  }

  if(check == false)
  {
    document.getElementById('form-next-button').setAttribute('class', 'next inactive');
    document.getElementById('form-first-block').removeAttribute('style');
    document.getElementById('form-second-block').removeAttribute('style');
  }

  else
  {
    var identifier  = document.getElementById('form-input-identifier').value;
    var name        = document.getElementById('form-input-name').value;
    var size        = document.getElementById('form-input-size-unit').value == 'Ko' ? document.getElementById('form-input-size').value : document.getElementById('form-input-size').value * 1024;

    var members     = {};
    var extensions  = {};

    var x = 0;
    var extensionCheckboxesToBrowse = document.getElementById('authorized-extensions').children;
    var membersToBrowse = document.getElementById('added').children;

    var browseMembersLoop = () =>
    {
      getMemberRights(membersToBrowse[x], (rights) =>
      {
        members[x] = {};
        members[x] = rights;

        if(membersToBrowse[x += 1] != undefined) browseMembersLoop();
      });
    }

    var browseExtensionsLoop = () =>
    {
      if(extensionCheckboxesToBrowse[x].children[1].checked == true) extensions[x] = extensionCheckboxesToBrowse[x].children[1].value;

      extensionCheckboxesToBrowse[x += 1] != undefined ? browseExtensionsLoop() :

      sendDataToServer({ identifier: identifier, name: name, size: size, members: members, extensions: extensions });
    }

    if(membersToBrowse[x] != undefined) browseMembersLoop();
    
    x = 0;

    extensionCheckboxesToBrowse[x] != undefined ? browseExtensionsLoop() :

    sendDataToServer({ identifier: identifier, name: name, size: size, members: members, extensions: extensions });
  }
}

/****************************************************************************************************/

function getMemberRights(member, callback)
{
  var values = member.children[1];

  var rights = {};

  rights.id = member.getAttribute('tag');

  rights.comment    = values.children[0].getAttribute('tag') == 'true' ? true : false;
  rights.upload     = values.children[2].getAttribute('tag') == 'true' ? true : false;
  rights.download   = values.children[4].getAttribute('tag') == 'true' ? true : false;
  rights.remove     = values.children[6].getAttribute('tag') == 'true' ? true : false;

  callback(rights);
}

/****************************************************************************************************/

function sendDataToServer(serviceData)
{
  document.getElementById('blur').style.filter = 'blur(4px)';

  var background          = document.createElement('div');
  var spinner             = document.createElement('div');

  background              .setAttribute('class', 'loader');
  spinner                 .setAttribute('class', 'spinner');

  spinner                 .innerHTML = `<i class='fas fa-circle-notch fa-spin'></i>`;

  background              .appendChild(spinner);

  document.body           .appendChild(background);

  var xhr   = new XMLHttpRequest();
  var data  = new FormData();

  data.append('service', JSON.stringify(serviceData));

  xhr.timeout = 10000;
  xhr.responseType = 'json';

  xhr.ontimeout = () =>
  {

  }

  xhr.onload = () =>
  {
    spinner.remove();

    var box       = document.createElement('div');
    var message   = document.createElement('div');
    var icon      = document.createElement('div');
    var content   = document.createElement('div');
    var button    = document.createElement('button');

    content       .innerText = xhr.response.message;
    button        .innerText = 'OK';

    box           .setAttribute('class', 'box');
    icon          .setAttribute('class', 'icon');
    content       .setAttribute('class', 'content');
    button        .setAttribute('class', 'button');

    button        .addEventListener('click', closeMessagePopup);

    if(xhr.status == 500 || xhr.status == 404 || xhr.status == 406)
    {
      message     .setAttribute('class', 'message error');
      icon        .innerHTML = `<i class='far fa-times-circle'></i>`;
    }

    else
    {
      document.getElementById('form-next-button')               .setAttribute('class', 'next inactive');

      document.getElementById('form-first-block')               .removeAttribute('style');
      document.getElementById('form-second-block')              .removeAttribute('style');
      document.getElementById('form-input-size-correct')        .removeAttribute('style');
      document.getElementById('form-input-name-correct')        .removeAttribute('style');
      document.getElementById('form-input-identifier-correct')  .removeAttribute('style');

      document.getElementById('form-input-identifier').value = '';
      document.getElementById('form-input-name').value = '';
      document.getElementById('form-input-size').value = '';
      document.getElementById('added').innerHTML = '';

      message     .setAttribute('class', 'message success');
      icon        .innerHTML = `<i class='far fa-check-circle'></i>`;
    }

    message       .appendChild(icon);
    message       .appendChild(content);
    box           .appendChild(message);
    box           .appendChild(button);
    background    .appendChild(box);
  }

  xhr.open('POST', '/queries/storage/services/create-service', true);

  xhr.send(data);
}

/****************************************************************************************************/

function closeMessagePopup(event)
{
  event.target.parentNode.parentNode.remove();
  document.getElementById('blur').removeAttribute('style');
}

/****************************************************************************************************/