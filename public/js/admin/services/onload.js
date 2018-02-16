/****************************************************************************************************/

getServicesList();

/****************************************************************************************************/

function getServicesList(event)
{
  if(document.getElementById('error')) document.getElementById('error').remove();

  document.getElementById('content').style.filter = 'blur(2px)';
  document.getElementById('background').style.display = 'block';

  $.ajax(
  {
    type: 'GET', timeout: 5000, dataType: 'JSON', url: '/admin/services/get-list', success: () => {},
    error: (xhr, status, error) => 
    {
      document.getElementById('content').removeAttribute('style');
      document.getElementById('background').removeAttribute('style');

      var error     = document.createElement('div');
      var message   = document.createElement('div');
      var reload    = document.createElement('button');

      error         .setAttribute('class', 'error');
      message       .setAttribute('class', 'message');
      reload        .setAttribute('class', 'reload');

      error         .setAttribute('id', 'error');

      if(status == 'timeout') message.innerHTML = `<i class='fas fa-exclamation-triangle icon'></i>Le serveur a mis trop de temps à répondre`;

      else
      {
        message.innerHTML = `<i class='fas fa-exclamation-triangle icon'></i>${xhr.responseJSON.message}`;

        if(xhr.responseJSON.detail != undefined)
        {
          var detail        = document.createElement('div');
          var header        = document.createElement('div');
          var content       = document.createElement('div');

          detail            .setAttribute('class', 'detail');
          header            .setAttribute('class', 'header');
          content           .setAttribute('class', 'content');

          header            .setAttribute('id', 'detail');
          header            .setAttribute('name', 'open');

          header            .addEventListener('click', openAndCloseDetail);

          header.innerHTML = `<div class='label'>Détail</div><i class='fas fa-chevron-circle-up arrow'></i>`;
          content.innerText = xhr.responseJSON.detail;

          detail            .appendChild(header);
          detail            .appendChild(content);
          error             .appendChild(detail);
        }
      }

      reload.innerText = 'Recharger';

      reload.addEventListener('click', getServicesList);

      error         .appendChild(message);
      if(detail != undefined) error.appendChild(detail);
      error         .appendChild(reload);

      document.getElementById('content').insertBefore(error, document.getElementById('content').children[1]);
    }
                  
  }).done((json) =>
  {
    displayServiceBlocks(json);
  });
}

/****************************************************************************************************/

function openAndCloseDetail(event)
{
  if(document.getElementById('detail').getAttribute('name') == 'open')
  {
    document.getElementById('detail').children[1].setAttribute('data-fa-transform', 'rotate-180');
    document.getElementById('error').children[1].children[1].style.display = 'block';
    document.getElementById('detail').setAttribute('name', 'close');
  }

  else
  {
    document.getElementById('detail').children[1].removeAttribute('data-fa-transform');
    document.getElementById('error').children[1].children[1].removeAttribute('style');
    document.getElementById('detail').setAttribute('name', 'open');
  }
}

/****************************************************************************************************/

function displayServiceBlocks(dataObject)
{
  var x = 0;

  var loadServiceBlockLoop = () =>
  {
    var block       = document.createElement('div');
    var header      = document.createElement('div');
    var files       = document.createElement('div');
    var members     = document.createElement('div');
    var access      = document.createElement('div');

    block           .setAttribute('class', 'block');
    header          .setAttribute('class', 'header');
    files           .setAttribute('class', 'data');
    members         .setAttribute('class', 'data');
    access          .setAttribute('class', 'data');

    block           .setAttribute('name', Object.keys(dataObject.services)[x]);

    block           .addEventListener('click', openServiceDetail);

    header.innerText = `${dataObject.services[Object.keys(dataObject.services)[x]].name.charAt(0).toUpperCase()}${dataObject.services[Object.keys(dataObject.services)[x]].name.slice(1)}`;

    dataObject.filesCounter[Object.keys(dataObject.services)[x]] == undefined ?
    files.innerHTML = `<div class='label'>Fichiers :</div><div class='value'>0</div>` :
    files.innerHTML = `<div class='label'>Fichiers :</div><div class='value'>${dataObject.filesCounter[Object.keys(dataObject.services)[x]]}</div>`;

    dataObject.membersCounter[Object.keys(dataObject.services)[x]] == undefined ?
    members.innerHTML = `<div class='label'>Membres :</div><div class='value'>0</div>` :
    members.innerHTML = `<div class='label'>Membres :</div><div class='value'>${dataObject.membersCounter[Object.keys(dataObject.services)[x]]}</div>`;

    dataObject.accessCounter[Object.keys(dataObject.services)[x]] == undefined ?
    access.innerHTML = `<div class='label'>Ayant accès :</div><div class='value'>0</div>` :
    access.innerHTML = `<div class='label'>Ayant accès :</div><div class='value'>${dataObject.accessCounter[Object.keys(dataObject.services)[x]]}</div>`;

    block.appendChild(header);
    block.appendChild(files);
    block.appendChild(members);
    block.appendChild(access);

    document.getElementById('service-blocks').appendChild(block);

    if(Object.keys(dataObject.services)[x += 1] != undefined) loadServiceBlockLoop();

    else
    {
      document.getElementById('content').removeAttribute('style');
      document.getElementById('background').removeAttribute('style');
    }
  }

  if(Object.keys(dataObject.services)[x] == undefined)
  {
    document.getElementById('content').removeAttribute('style');
    document.getElementById('background').removeAttribute('style');

    var warning   = document.createElement('div');
    var message   = document.createElement('div');
    var reload    = document.createElement('button');

    warning       .setAttribute('class', 'error');
    message       .setAttribute('class', 'message');
    reload        .setAttribute('class', 'reload');

    warning       .setAttribute('id', 'error');

    message.innerHTML = `<i class='fas fa-exclamation-triangle warning'></i>Il n'existe pas de services actuellement`;

    reload.innerText = 'Recharger';

    reload.addEventListener('click', getServicesList);

    warning         .appendChild(message);
    warning         .appendChild(reload);

    document.getElementById('content').insertBefore(warning, document.getElementById('content').children[1]);
  }

  else
  {
    loadServiceBlockLoop();
  }
}

/****************************************************************************************************/

function openServiceDetail(event)
{
  var getParentLoop = (element) =>
  {
    if(element.hasAttribute('name'))
    {
      location = `/admin/services/${element.getAttribute('name')}`;
    }

    else
    {
      getParentLoop(element.parentElement);
    }
  }

  getParentLoop(event.target);
}

/****************************************************************************************************/