window.onload = $(() =>
{
  var socket = io();
  
  socket.on('connect', () =>
  {
    socket.emit('join_file', $('.file-main-block').attr('id'));
    updateFileLogs($('.file-main-block').attr('id'));
  });

  socket.on('upload_file', (logID) =>
  {
    printSuccess('Le fichier vient d\'être envoyé');

    $.ajax(
    {
      type: 'PUT', timeout: 2000, dataType: 'JSON', data: { service: $('.file-main-block').attr('name') }, url: '/service/get-user-rights', success: () => {},
      error: (xhr, status, error) => { printError(JSON.parse(xhr.responseText).message); }
                    
    }).done((json) =>
    {
      $('.actions .deleted').remove();

      var remove          = document.createElement('button');
      var comment         = document.createElement('button');
      var download        = document.createElement('button');

      json.rights['remove_files'] == 1 ?
      $(remove).attr('class', 'delete') :
      $(remove).attr('class', 'delete-inactive');

      json.rights['post_comments'] == 1 ?
      $(comment).attr('class', 'comment') :
      $(comment).attr('class', 'comment-inactive');

      json.rights['download_files'] == 1 ?
      $(download).attr('class', 'download') :
      $(download).attr('class', 'download-inactive');

      $(remove)       .html(`<i class="fa fa-trash icon" aria-hidden="true"></i><div class='label'>Supprimer</div>`);
      $(comment)      .html(`<i class="fa fa-comment icon" aria-hidden="true"></i><div class='label'>Commenter</div>`);
      $(download)     .html(`<i class="fa fa-download icon" aria-hidden="true"></i><div class='label'>Télécharger</div>`);

      $(download)     .appendTo('.actions');
      $(remove)       .appendTo('.actions');
      $(comment)      .appendTo('.actions');

      var x = 0;
      var pageSelectors = document.getElementById('pages-container').children;

      var getPageSelectorLoop = () =>
      {
        if(pageSelectors.length == 0) uploadFileLogs(logID, 1);

        else
        {
          if(pageSelectors[x].getAttribute('class') == 'page-selected') uploadFileLogs(logID, parseInt(pageSelectors[x].getAttribute('tag')));

          else
          {
            if(pageSelectors[x += 1] != undefined) getPageSelectorLoop();
          }
        }
      }

      getPageSelectorLoop();
    });
  });
  
  socket.on('post_comment', (logID) =>
  {
    var x = 0;
    var pageSelectors = document.getElementById('pages-container').children;

    var getPageSelectorLoop = () =>
    {
      if(pageSelectors.length == 0) uploadFileLogs(logID, 1);

      else
      {
        if(pageSelectors[x].getAttribute('class') == 'page-selected') uploadFileLogs(logID, parseInt(pageSelectors[x].getAttribute('tag')));

        else
        {
          if(pageSelectors[x += 1] != undefined) getPageSelectorLoop();
        }
      }
    }

    getPageSelectorLoop();
  });

  socket.on('delete_file', (logID) =>
  {
    document.getElementById('actions').children[3].remove();
    document.getElementById('actions').children[2].remove();
    document.getElementById('actions').children[1].remove();
  
    var deleted = document.createElement('div');
    deleted.setAttribute('class', 'deleted');
    deleted.innerText = 'Supprimé';

    document.getElementById('actions').appendChild(deleted);
    
    var x = 0;
    var pageSelectors = document.getElementById('pages-container').children;

    var getPageSelectorLoop = () =>
    {
      if(pageSelectors.length == 0) uploadFileLogs(logID, 1);

      else
      {
        if(pageSelectors[x].getAttribute('class') == 'page-selected') uploadFileLogs(logID, parseInt(pageSelectors[x].getAttribute('tag')));

        else
        {
          if(pageSelectors[x += 1] != undefined) getPageSelectorLoop();
        }
      }
    }

    getPageSelectorLoop();
  });

  socket.on('download_file', (logID) =>
  {
    var x = 0;
    var pageSelectors = document.getElementById('pages-container').children;

    var getPageSelectorLoop = () =>
    {
      if(pageSelectors.length == 0) uploadFileLogs(logID, 1);

      else
      {
        if(pageSelectors[x].getAttribute('class') == 'page-selected') uploadFileLogs(logID, parseInt(pageSelectors[x].getAttribute('tag')));

        else
        {
          if(pageSelectors[x += 1] != undefined) getPageSelectorLoop();
        }
      }
    }

    getPageSelectorLoop();
  });
});