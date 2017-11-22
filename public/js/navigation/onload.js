window.onload = $(function()
{
  $(document.getElementsByName(window.location.href.split('/')[3])).css('color', '#77B5FE');

  $.ajax(
  {
    type: 'GET', timeout: 2000, dataType: 'JSON', url: '/rights/session-identifier', success: function(){},
    error: function(xhr, status, error){ printError(`ERROR [${xhr['status']}] - ${error} !`); }
                      
  }).done(function(result)
  {
    $.ajax(
    {
      type: 'PUT', timeout: 2000, dataType: 'JSON', data:{ identifier: result.identifier }, url: '/rights/is-admin', success: function(){},
      error: function(xhr, status, error){ printError(`ERROR [${xhr['status']}] - ${error} !`); }
                        
    }).done(function(result)
    {
      if(result.admin == false) $('#admin-link').remove();
    });
  });
});