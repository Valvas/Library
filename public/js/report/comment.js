window.onload = $(() =>
{
  /******************************************************************************************/

  $('body').on('click', '.reports-main-block .comments-block .comment-button', (event) =>
  {
    $('body').css('overflow', 'hidden');
    openReportCommentPopup('Ajouter Un Commentaire');
  });

  /******************************************************************************************/

  $('body').on('click', '#report-comment-popup-cancel', (event) =>
  {
    $('body').css('overflow', '');
    $('#report-comment-popup').remove();
    $('#veil').remove();
  });

  /******************************************************************************************/

  $('body').on('click', '#report-comment-popup-send', (event) =>
  {
    $('#report-comment-popup-description').val() == '' ?
      
    $('#report-comment-popup-description').css('background-color', '#FF6347') :

    $.ajax(
    {
      type: 'POST', timeout: 2000, dataType: 'JSON', data: { report: $('#report-detail').attr('name'), comment: $('#report-comment-popup-description').val() }, url: '/reports/add-comment', success: () => {},
      error: (xhr, status, error) => printError(JSON.parse(xhr.responseText).message)
                      
    }).done((json) =>
    {
      printSuccess(json.message);

      $('body').css('overflow', 'auto');
      $('#report-comment-popup').remove();
      $('#veil').remove();
    });
  });

  /****************************************************************************************************/
  
  $('body').on('click', '#report-comment-popup-description', (event) =>
  {
    $(event.target).css('background-color', '#FFFFFF');
  });
  
  /******************************************************************************************/
});