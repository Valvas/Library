window.onload = $(() =>
{
  /****************************************************************************************************/

  $('body').on('click', '.log-button', (event) =>
  {
    if($(event.target).parent().attr('name') == 0)
    {
      $.ajax(
      {
        type: 'PUT', timeout: 2000, dataType: 'JSON', data: { commentID: $(event.target).parent().attr('id'), commentStatus: true }, url: '/admin/reports/update-comment-status', success: () => {},
        error: (xhr, status, error) => { printError(JSON.parse(xhr.responseText).message); } 
        
      }).done((json) =>
      {
        printSuccess(json.message);
        $(event.target).parent().attr('class', 'comment admin-comment read-comment');
        $(event.target).parent().attr('name', '1');
        $(event.target).attr('class', 'log-button log-button-not-read');
        $(event.target).text('Marquer comme non-lu');
      });
    }

    else
    {
      $.ajax(
      {
        type: 'PUT', timeout: 2000, dataType: 'JSON', data: { commentID: $(event.target).parent().attr('id'), commentStatus: false }, url: '/admin/reports/update-comment-status', success: () => {},
        error: (xhr, status, error) => { printError(JSON.parse(xhr.responseText).message); } 
          
      }).done((json) =>
      {
        printSuccess(json.message);
        $(event.target).parent().attr('class', 'comment admin-comment not-read-comment');
        $(event.target).parent().attr('name', '0');
        $(event.target).attr('class', 'log-button log-button-read');
        $(event.target).text('Marquer comme lu');
      });
    }
  });

  /****************************************************************************************************/

  $('#status-selection').on('change', (event) =>
  {
    var select = document.getElementById('status-selection');
    $(select).css('color', $(select.options[select.selectedIndex]).css('color'));

    $.ajax(
    {
      type: 'PUT', timeout: 2000, dataType: 'JSON', data: { reportUUID: $('#report-detail').attr('name'), reportStatus: $(select.options[select.selectedIndex]).val() }, url: '/admin/reports/update-report-status', success: () => {},
      error: (xhr, status, error) => { printError(JSON.parse(xhr.responseText).message); } 
          
    }).done((json) =>
    {
      printSuccess(json.message);
      $('#report-status').text($(select.options[select.selectedIndex]).text());
      $('#report-status').css('color', $(select.options[select.selectedIndex]).css('color'));
    });
  });

  /****************************************************************************************************/
});