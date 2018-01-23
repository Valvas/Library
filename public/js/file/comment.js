window.onload = $(() =>
{
  var socket = io();

  /****************************************************************************************************/

  $('body').on('click', '.actions .comment', (event) =>
  {
    $('body').css('overflow', 'hidden');

    openFileCommentPopup();
  });

  /****************************************************************************************************/

  $('body').on('click', '#file-comment-popup-send', (event) =>
  {
    if($('#file-comment-popup-description').val() == '')
    {
      $('#file-comment-popup-description').css('border', '1px solid #FF0000');
      $('#file-comment-popup-error').text('Veuillez entrer un commentaire !');
    }

    else
    {
      $('#file-comment-popup-send').hide();
      $('#file-comment-popup-cancel').hide();
      $('#file-comment-popup-spinner').show();

      $.ajax(
      {
        type: 'POST', timeout: 5000, dataType: 'JSON', data: { service: $('.file-main-block').attr('name'), file: $('.file-main-block').attr('id'), comment: $('#file-comment-popup-description').val() }, url: '/file/post-comment', success: () => {},
        error: (xhr, status, error) => { printError(JSON.parse(xhr.responseText).message); }
                      
      }).done((json) =>
      {
        $('#veil').remove();
        $('#file-comment-popup').remove();
        $('body').css('overflow', '');
        printSuccess(json.message);

        socket.emit('post_comment', { room: $('.file-main-block').attr('id'), logID: json.log });
      });
    }
  });

  /****************************************************************************************************/

  $('body').on('focus', '#file-comment-popup-description', (event) =>
  {
    if($('#file-comment-popup-error').text().length > 0)
    {
      $('#file-comment-popup-description').css('border', '');
      $('#file-comment-popup-error').text('');
    }
  });

  /****************************************************************************************************/

  $('body').on('click', '#file-comment-popup-cancel', (event) =>
  {
    $('#veil').remove();
    $('#file-comment-popup').remove();
    $('body').css('overflow', '');
  });

  /****************************************************************************************************/
});