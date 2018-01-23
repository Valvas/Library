window.onload = $(() =>
{
  var socket = io();
  
  socket.on('connect', () =>
  {
    socket.emit('join_file', $('.file-main-block').attr('id'));
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

      uploadFileLogs(logID);
    });
  });
  
  socket.on('post_comment', (logID) =>
  {
    uploadFileLogs(logID);
  });

  socket.on('delete_file', (logID) =>
  {
    $('.actions').html(`<div class='deleted'>Supprimé</div>`);
    
    uploadFileLogs(logID);
  });

  socket.on('download_file', (logID) =>
  {
    uploadFileLogs(logID);
  });
});