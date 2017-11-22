window.onload = $(function()
{
  $('body').on('click', '#popup-cancel-button', function(event)
  {
    if($(event.target).parent().attr('id') == 'logout-popup')
    {
      if(document.getElementById('logout-popup')) $(document.getElementById('logout-popup')).remove();
      if(document.getElementById('veil')) $(document.getElementById('veil')).remove();
    }
  });

  $('body').on('click', '#popup-perform-button', function(event)
  {
    if($(event.target).parent().attr('id') == 'logout-popup')
    {
      $.ajax(
      {
        type: 'GET', timeout: 2000, url: '/logout', success: function(){},
        error: function(xhr, status, error){ printError(`ERROR [${xhr['status']}] - ${error} !`); }                      
      }).done(function(){ location = '/'; });
    }
  });
});