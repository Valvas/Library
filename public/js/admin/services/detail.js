/****************************************************************************************************/

getServiceDetail();

document.getElementById('reload').addEventListener('click', getServiceDetail);

/****************************************************************************************************/

function getServiceDetail()
{
  document.getElementById('error').removeAttribute('style');
  document.getElementById('error').children[2].removeAttribute('style');
  document.getElementById('access').children[1].removeAttribute('style');
  document.getElementById('members').children[1].removeAttribute('style');
  document.getElementById('content').style.filter = 'blur(2px)';
  document.getElementById('background').style.display = 'block';

  $.ajax(
  {
    type: 'POST', timeout: 5000, dataType: 'JSON', data: { service: document.getElementById('main').getAttribute('name') }, url: '/admin/services/get-detail', success: () => {},
    error: (xhr, status, error) => 
    {
      document.getElementById('content').removeAttribute('style');
      document.getElementById('background').removeAttribute('style');
      document.getElementById('error').style.display = 'block';

      if(status == 'timeout')
      {
        document.getElementById('error').children[1].innerText = 'Le serveur a mis trop de temps à répondre';
      }

      else
      {
        document.getElementById('error').children[1].innerText = xhr.responseJSON.message;

        if(xhr.responseJSON.detail != undefined)
        {
          document.getElementById('error').children[2].children[1].innerText = xhr.responseJSON.detail;
          document.getElementById('error').children[2].style.display = 'block';
        }
      }
    }

  }).done((json) =>
  {
    document.getElementById('detail').style.display = 'block';

    if(Object.keys(json.members).length == 0) document.getElementById('members').children[1].style.display = 'block';
    if(Object.keys(json.access).length == 0) document.getElementById('access').children[1].style.display = 'block';

    updateMembersList(json.members, () =>
    {
      updateRightsList(json.access, () =>
      {
        document.getElementById('content').removeAttribute('style');
        document.getElementById('background').removeAttribute('style');
      });
    });
  });
}

/****************************************************************************************************/

function updateMembersList(members, callback)
{
  var x = 0;
  
  var loop = () =>
  {
    var line        = document.createElement('div');
    var firstname   = document.createElement('div');
    var lastname    = document.createElement('div');

    line            .setAttribute('class', 'line');
    lastname        .setAttribute('class', 'value');
    firstname       .setAttribute('class', 'value');

    lastname        .innerText = `${members[Object.keys(members)[x]].lastname.toUpperCase()}`;
    firstname       .innerText = `${members[Object.keys(members)[x]].firstname.charAt(0).toUpperCase()}${members[Object.keys(members)[x]].firstname.slice(1).toLowerCase()}`;
    
    line            .appendChild(firstname);
    line            .appendChild(lastname);

    document.getElementById('members').appendChild(line);

    Object.keys(members)[x += 1] == undefined ? callback() : loop();
  }

  Object.keys(members).length == 0 ? callback() : loop();
}

/****************************************************************************************************/

function updateRightsList(access, callback)
{
  if(Object.keys(access).length > 0)
  {
    var labels      = document.createElement('div');

    var comment     = document.createElement('div');
    var upload      = document.createElement('div');
    var download    = document.createElement('div');
    var remove      = document.createElement('div');

    labels          .setAttribute('class', 'labels');
    comment         .setAttribute('class', 'icon');
    upload          .setAttribute('class', 'icon');
    download        .setAttribute('class', 'icon');
    remove          .setAttribute('class', 'icon');

    comment         .innerHTML = `<i class='far fa-comments'></i>`;
    upload          .innerHTML = `<i class='fas fa-cloud-upload-alt'></i>`;
    download        .innerHTML = `<i class='fas fa-cloud-download-alt'></i>`;
    remove          .innerHTML = `<i class='fas fa-trash'></i>`;

    labels          .appendChild(comment);
    labels          .appendChild(upload);
    labels          .appendChild(download);
    labels          .appendChild(remove);

    document.getElementById('access').appendChild(labels);
  }

  var x = 0;
  
  var loop = () =>
  {
    var line        = document.createElement('div');
    var firstname   = document.createElement('div');
    var lastname    = document.createElement('div');
    var comment     = document.createElement('div');
    var upload      = document.createElement('div');
    var download    = document.createElement('div');
    var remove      = document.createElement('div');

    line            .setAttribute('class', 'line');
    lastname        .setAttribute('class', 'value');
    firstname       .setAttribute('class', 'value');

    access[Object.keys(access)[x]].rights.post_comments       == 1 ? comment      .setAttribute('class', 'tick') : comment      .setAttribute('class', 'cross');
    access[Object.keys(access)[x]].rights.upload_files        == 1 ? upload       .setAttribute('class', 'tick') : upload       .setAttribute('class', 'cross');
    access[Object.keys(access)[x]].rights.download_files      == 1 ? download     .setAttribute('class', 'tick') : download     .setAttribute('class', 'cross');
    access[Object.keys(access)[x]].rights.remove_files        == 1 ? remove       .setAttribute('class', 'tick') : remove       .setAttribute('class', 'cross');

    access[Object.keys(access)[x]].rights.post_comments       == 1 ? comment      .innerHTML = `<i class='far fa-check-circle'></i>` : comment      .innerHTML = `<i class='far fa-times-circle'></i>`;
    access[Object.keys(access)[x]].rights.upload_files        == 1 ? upload       .innerHTML = `<i class='far fa-check-circle'></i>` : upload       .innerHTML = `<i class='far fa-times-circle'></i>`;
    access[Object.keys(access)[x]].rights.download_files      == 1 ? download     .innerHTML = `<i class='far fa-check-circle'></i>` : download     .innerHTML = `<i class='far fa-times-circle'></i>`;
    access[Object.keys(access)[x]].rights.remove_files        == 1 ? remove       .innerHTML = `<i class='far fa-check-circle'></i>` : remove       .innerHTML = `<i class='far fa-times-circle'></i>`;

    lastname        .innerText = `${access[Object.keys(access)[x]].account.lastname.toUpperCase()}`;
    firstname       .innerText = `${access[Object.keys(access)[x]].account.firstname.charAt(0).toUpperCase()}${access[Object.keys(access)[x]].account.firstname.slice(1).toLowerCase()}`;
    
    line            .appendChild(firstname);
    line            .appendChild(lastname);
    line            .appendChild(comment);
    line            .appendChild(upload);
    line            .appendChild(download);
    line            .appendChild(remove);

    document.getElementById('access').appendChild(line);

    Object.keys(access)[x += 1] == undefined ? callback() : loop();
  }

  Object.keys(access).length == 0 ? callback() : loop();
}

/****************************************************************************************************/